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

class UserController extends AbstractController
{
    #[Route('/', name: 'user_form')]
    public function form(Request $request, ValidatorInterface $validator, CsrfTokenManagerInterface $csrfTokenManager): Response
    {
        $user = new User();
        $errors = [];
        $success = false;
        $csrfToken = $csrfTokenManager->getToken('user_form')->getValue();
        
        if ($request->isMethod('POST')) {
            $token = $request->request->get('_csrf_token');
            if (!$csrfTokenManager->isTokenValid(new CsrfToken('user_form', $token))) {
                $errors[] = 'Jeton CSRF invalide, veuillez réessayer.';
            } else {
                $user->setFullname($request->request->get('fullname'));
                $user->setEmail($request->request->get('email'));
                $user->setPhone($request->request->get('phone'));
                $user->setBirthdate($request->request->get('birthdate'));
                $user->setAddress($request->request->get('address'));

                $violations = $validator->validate($user);
                if (count($violations) > 0) {
                    foreach ($violations as $violation) {
                        $errors[] = $violation->getPropertyPath() . ': ' . $violation->getMessage();
                    }
                } else {
                    // Préparer les données
                    $data = [
                        'fullname' => $user->getFullname(),
                        'email' => $user->getEmail(),
                        'phone' => $user->getPhone(),
                        'birthdate' => $user->getBirthdate(),
                        'address' => $user->getAddress(),
                        'created_at' => date('c'),
                    ];

                    // Définir les chemins des fichiers dans un répertoire accessible
                    $dataDir = $this->getParameter('kernel.project_dir') . '/app';
                    $jsonFile = $dataDir . '/data.json';
                    $csvFile = $dataDir . '/data.csv';
                    $debugFile = $dataDir . '/debug.log';

                    // Créer le répertoire s'il n'existe pas
                    if (!is_dir($dataDir)) {
                        if (!mkdir($dataDir, 0775, true)) {
                            $errors[] = 'Impossible de créer le répertoire : ' . $dataDir;
                            return $this->render('user/form.html.twig', [
                                'user' => $user,
                                'errors' => $errors,
                                'success' => false,
                                'csrf_token' => $csrfToken,
                            ]);
                        }
                    }

                    // Vérifier les permissions du répertoire
                    if (!is_writable($dataDir)) {
                        $errors[] = 'Le répertoire n\'est pas accessible en écriture : ' . $dataDir;
                        return $this->render('user/form.html.twig', [
                            'user' => $user,
                            'errors' => $errors,
                            'success' => false,
                            'csrf_token' => $csrfToken,
                        ]);
                    }

                    $success = true;

                    // Sauvegarde JSON avec meilleure gestion d'erreurs
                    try {
                        $jsonData = [];
                        if (file_exists($jsonFile)) {
                            $jsonContent = file_get_contents($jsonFile);
                            if ($jsonContent !== false) {
                                $jsonData = json_decode($jsonContent, true) ?: [];
                            }
                        }
                        
                        $jsonData[] = $data;
                        $jsonWrite = file_put_contents($jsonFile, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                        
                        if ($jsonWrite === false) {
                            $errors[] = 'Erreur lors de l\'écriture dans data.json. Chemin : ' . $jsonFile;
                            $success = false;
                        } else {
                            // Log de succès
                            error_log(date('c') . " - JSON écrit avec succès : " . $jsonWrite . " bytes");
                            if (file_exists($debugFile)) {
                                file_put_contents($debugFile, date('c') . " - JSON OK (" . $jsonWrite . " bytes)\n", FILE_APPEND | LOCK_EX);
                            }
                        }
                    } catch (Exception $e) {
                        $errors[] = 'Erreur lors de la sauvegarde JSON : ' . $e->getMessage();
                        $success = false;
                    }

                    // Sauvegarde CSV avec meilleure gestion d'erreurs
                    if ($success) {
                        try {
                            $isNew = !file_exists($csvFile);
                            $fp = fopen($csvFile, 'a');
                            
                            if ($fp === false) {
                                $errors[] = 'Impossible d\'ouvrir le fichier CSV : ' . $csvFile;
                                $success = false;
                            } else {
                                // Verrouiller le fichier pendant l'écriture
                                if (flock($fp, LOCK_EX)) {
                                    if ($isNew) {
                                        fputcsv($fp, array_keys($data));
                                    }
                                    fputcsv($fp, $data);
                                    fflush($fp);
                                    flock($fp, LOCK_UN);
                                    
                                    // Log de succès
                                    error_log(date('c') . " - CSV écrit avec succès");
                                    if (file_exists($debugFile)) {
                                        file_put_contents($debugFile, date('c') . " - CSV OK\n", FILE_APPEND | LOCK_EX);
                                    }
                                } else {
                                    $errors[] = 'Impossible de verrouiller le fichier CSV';
                                    $success = false;
                                }
                                fclose($fp);
                            }
                        } catch (Exception $e) {
                            $errors[] = 'Erreur lors de la sauvegarde CSV : ' . $e->getMessage();
                            $success = false;
                        }
                    }

                    // Log final
                    if ($success) {
                        if (file_exists($debugFile)) {
                            file_put_contents($debugFile, date('c') . " - Sauvegarde complète réussie\n", FILE_APPEND | LOCK_EX);
                        }
                    }
                }
            }
        }

        return $this->render('user/form.html.twig', [
            'user' => $user,
            'errors' => $errors,
            'success' => $success,
            'csrf_token' => $csrfToken,
        ]);
    }
}