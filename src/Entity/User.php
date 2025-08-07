<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\Column(type: 'string', length: 50)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 50)]
    private $fullname;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private $email;

    #[ORM\Column(type: 'string', length: 12)]
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: "/^(6\d{8}|2376\d{8})$/",
        message: "Le numéro doit être au format 6XX... ou 2376..."
    )]
    #[Assert\Length(min: 9, max: 12)]
    private $phone;

    #[ORM\Column(type: 'date')]
    #[Assert\NotBlank]
    #[Assert\Date]
    #[Assert\LessThan("today")]
    private $birthdate;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    private $address;

    #[ORM\Column(type: 'datetime', options: ["default" => "CURRENT_TIMESTAMP"])]
    private $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    // Getters et setters
    public function getId(): ?int { return $this->id; }

    public function getFullname(): ?string { return $this->fullname; }
    public function setFullname(?string $fullname): self { 
        $this->fullname = $fullname; 
        return $this;
    }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): self { 
        $this->email = $email; 
        return $this;
    }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): self { 
        $this->phone = $phone; 
        return $this;
    }

    public function getBirthdate(): ?\DateTime { return $this->birthdate; }
    public function setBirthdate($birthdate): self { 
        if (is_string($birthdate)) {
            try {
                // Validation du format de date
                if (empty($birthdate)) {
                    $this->birthdate = null;
                } else {
                    $this->birthdate = new \DateTime($birthdate);
                }
            } catch (\Exception $e) {
                // En cas d'erreur, on laisse null pour que la validation Symfony gère l'erreur
                $this->birthdate = null;
                throw new \InvalidArgumentException('Format de date invalide: ' . $birthdate);
            }
        } else {
            $this->birthdate = $birthdate;
        }
        return $this;
    }

    public function getAddress(): ?string { return $this->address; }
    public function setAddress(?string $address): self { 
        $this->address = $address; 
        return $this;
    }

    public function getCreatedAt(): ?\DateTime { return $this->createdAt; }
    public function setCreatedAt(?\DateTime $createdAt): self { 
        $this->createdAt = $createdAt; 
        return $this;
    }
}