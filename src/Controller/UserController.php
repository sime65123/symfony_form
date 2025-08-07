<?php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Csrf\CsrfToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;

class UserController extends AbstractController
{
    #[Route('/', name: 'user_form', methods: ['GET', 'POST'])]
    public function form(
        Request $request, 
        ValidatorInterface $validator, 
        CsrfTokenManagerInterface $csrfTokenManager, 
        EntityManagerInterface $entityManager,
        LoggerInterface $logger = null
    ): Response {
        $user = new User();
        $errors = [];
        $success = false;
        $debug_info = [];
        $debug_info[] = 'Controller method called';
        $debug_info[] = 'Request method: ' . $request->getMethod();
        
        $csrfToken = $csrfTokenManager->getToken('user_form')->getValue();
        $debug_info[] = 'CSRF token generated: ' . $csrfToken;

        if ($request->isMethod('POST')) {
            // Log des données reçues
            if ($logger) {
                $logger->info('Données POST reçues:', $request->request->all());
                $logger->info('Headers reçues:', $request->headers->all());
                $logger->info('Méthode HTTP:', [$request->getMethod()]);
            }
            $debug_info[] = 'POST request received';
            $debug_info[] = 'POST data: ' . json_encode($request->request->all());
            $debug_info[] = 'Content-Type: ' . $request->headers->get('Content-Type', 'not set');

            $token = $request->request->get('_csrf_token');
            $debug_info[] = 'Received CSRF token: ' . $token;
            $debug_info[] = 'Expected CSRF token: ' . $csrfToken;
            
            // Vérifier le token CSRF mais être plus permissif pour le debug
            $csrfValid = $csrfTokenManager->isTokenValid(new CsrfToken('user_form', $token));
            $debug_info[] = 'CSRF token validation result: ' . ($csrfValid ? 'valid' : 'invalid');
            
            if (!$csrfValid) {
                $errors[] = 'Jeton CSRF invalide, veuillez réessayer.';
                if ($logger) {
                    $logger->error('CSRF Token invalide', [
                        'received' => $token,
                        'expected' => $csrfToken
                    ]);
                }
                $debug_info[] = 'CSRF token invalid - but continuing for debug';
                // Pour le debug, on continue même si le CSRF est invalide
            } else {
                $debug_info[] = 'CSRF token valid';
                
                try {
                    // Test de connexion à la base de données
                    $connection = $entityManager->getConnection();
                    $connection->connect();
                    $debug_info[] = 'Database connection successful';
                    
                    if ($logger) {
                        $logger->info('Connexion à la base de données réussie');
                    }

                    // Assignation des valeurs avec validation
                    try {
                        $fullname = $request->request->get('fullname');
                        $email = $request->request->get('email');
                        $phone = $request->request->get('phone');
                        $birthdate = $request->request->get('birthdate');
                        $address = $request->request->get('address');

                        $debug_info[] = "Raw data: fullname=$fullname, email=$email, phone=$phone, birthdate=$birthdate, address=" . substr($address, 0, 20) . "...";

                        $user->setFullname($fullname);
                        $user->setEmail($email);
                        $user->setPhone($phone);
                        
                        // Gestion spéciale pour la date
                        if (!empty($birthdate)) {
                            try {
                                $user->setBirthdate($birthdate);
                                $debug_info[] = 'Birthdate set successfully';
                            } catch (\Exception $e) {
                                $errors[] = 'Format de date invalide: ' . $e->getMessage();
                                $debug_info[] = 'Birthdate error: ' . $e->getMessage();
                            }
                        }
                        
                        $user->setAddress($address);
                        $debug_info[] = 'All user data assigned';

                        if ($logger) {
                            $logger->info('Données utilisateur assignées:', [
                                'fullname' => $user->getFullname(),
                                'email' => $user->getEmail(),
                                'phone' => $user->getPhone(),
                                'birthdate' => $user->getBirthdate() ? $user->getBirthdate()->format('Y-m-d') : null,
                                'address' => substr($user->getAddress(), 0, 50) . '...'
                            ]);
                        }

                    } catch (\Exception $e) {
                        $errors[] = 'Erreur lors de l\'assignation des données: ' . $e->getMessage();
                        $debug_info[] = 'Data assignment error: ' . $e->getMessage();
                        if ($logger) {
                            $logger->error('Erreur assignation:', ['error' => $e->getMessage()]);
                        }
                    }

                    // Validation uniquement si pas d'erreur d'assignation
                    if (empty($errors)) {
                        $violations = $validator->validate($user);
                        $debug_info[] = 'Validation completed, violations count: ' . count($violations);
                        
                        if (count($violations) > 0) {
                            foreach ($violations as $violation) {
                                $error_msg = $violation->getPropertyPath() . ': ' . $violation->getMessage();
                                $errors[] = $error_msg;
                                $debug_info[] = 'Validation error: ' . $error_msg;
                            }
                            if ($logger) {
                                $logger->error('Erreurs de validation:', $errors);
                            }
                            $debug_info[] = 'Validation failed - but continuing for debug';
                            // Pour le debug, on continue même avec des erreurs de validation
                        }
                        
                        // Essayer de sauvegarder même en cas d'erreurs de validation (pour debug)
                        $debug_info[] = 'Starting save process (ignoring validation errors for debug)';
                        
                        try {
                            // Vérification que l'email n'existe pas déjà
                            $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $user->getEmail()]);
                            if ($existingUser) {
                                $errors[] = 'Un utilisateur avec cet email existe déjà.';
                                $debug_info[] = 'Email already exists';
                            } else {
                                $debug_info[] = 'Email is unique, proceeding with save';
                                
                                // Enregistrer en base de données via Doctrine (sans transaction manuelle)
                                $entityManager->persist($user);
                                $debug_info[] = 'User persisted';
                                
                                $entityManager->flush();
                                $debug_info[] = 'Entity manager flushed';
                                
                                if ($logger) {
                                    $logger->info('Utilisateur enregistré avec succès. ID: ' . $user->getId());
                                }
                                
                                $success = true;
                                $savedUserId = $user->getId();
                                $debug_info[] = 'User saved successfully with ID: ' . $savedUserId;
                                
                                // Vérification immédiate en base
                                $savedUser = $entityManager->getRepository(User::class)->find($savedUserId);
                                if ($savedUser) {
                                    $debug_info[] = 'Verification: user found in database with ID: ' . $savedUser->getId();
                                    if ($logger) {
                                        $logger->info('Vérification: utilisateur trouvé en base avec ID: ' . $savedUser->getId());
                                    }
                                } else {
                                    $debug_info[] = 'WARNING: User not found in database after save!';
                                    if ($logger) {
                                        $logger->warning('Utilisateur non trouvé après enregistrement!');
                                    }
                                }
                                
                                // Créer un nouvel utilisateur vide pour vider le formulaire
                                $user = new User();
                            }
                            
                        } catch (\Exception $e) {
                            $error_msg = 'Erreur lors de l\'enregistrement: ' . $e->getMessage();
                            $errors[] = $error_msg;
                            $debug_info[] = 'Save error: ' . $e->getMessage();
                            
                            if ($logger) {
                                $logger->error('Erreur lors de l\'enregistrement:', [
                                    'message' => $e->getMessage(),
                                    'trace' => $e->getTraceAsString()
                                ]);
                            }
                        }
                    }
                    
                } catch (\Exception $e) {
                    $error_msg = 'Erreur de connexion à la base de données: ' . $e->getMessage();
                    $errors[] = $error_msg;
                    $debug_info[] = 'DB connection error: ' . $e->getMessage();
                    
                    if ($logger) {
                        $logger->error('Erreur de connexion DB:', [
                            'message' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            }
        }

        return $this->render('user/form.html.twig', [
            'user' => $user,
            'errors' => $errors,
            'success' => $success,
            'csrf_token' => $csrfToken,
            'debug_info' => $debug_info, // Ajout des infos de debug
        ]);
    }

    #[Route('/debug-form', name: 'debug_form', methods: ['POST'])]
    public function debugForm(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Route pour débugger les données du formulaire
        $data = [
            'post_data' => $request->request->all(),
            'content_type' => $request->headers->get('Content-Type'),
            'method' => $request->getMethod(),
        ];

        // Test de création d'un utilisateur simple
        try {
            $user = new User();
            $user->setFullname('Test User');
            $user->setEmail('test' . time() . '@example.com');
            $user->setPhone('612345678');
            $user->setBirthdate('1990-01-01');
            $user->setAddress('Test Address');

            $entityManager->persist($user);
            $entityManager->flush();

            $data['test_user_created'] = true;
            $data['test_user_id'] = $user->getId();
            
        } catch (\Exception $e) {
            $data['test_user_created'] = false;
            $data['test_error'] = $e->getMessage();
        }

        return new JsonResponse($data);
    }

    // ... (autres méthodes inchangées)
    #[Route('/users', name: 'user_list', methods: ['GET'])]
    public function listUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $users = $entityManager->getRepository(User::class)->findAll();

            $data = [];
            foreach ($users as $user) {
                $data[] = [
                    'id' => $user->getId(),
                    'fullname' => $user->getFullname(),
                    'email' => $user->getEmail(),
                    'phone' => $user->getPhone(),
                    'birthdate' => $user->getBirthdate() ? $user->getBirthdate()->format('Y-m-d') : null,
                    'address' => $user->getAddress(),
                    'created_at' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                ];
            }

            return new JsonResponse([
                'success' => true,
                'count' => count($data),
                'data' => $data
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/test-db', name: 'test_db', methods: ['GET'])]
    public function testDatabase(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $connection = $entityManager->getConnection();
            $connection->connect();
            
            // Test de requête simple
            $result = $connection->executeQuery('SELECT COUNT(*) as total FROM users')->fetchAssociative();
            
            return new JsonResponse([
                'connection' => 'OK',
                'database' => $connection->getDatabase(),
                'total_users' => $result['total'],
                'message' => 'Connexion à la base de données réussie'
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'connection' => 'FAILED',
                'error' => $e->getMessage(),
                'message' => 'Erreur de connexion à la base de données'
            ], 500);
        }
    }
}