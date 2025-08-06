<?php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class User
{
    /**
     * @Assert\NotBlank()
     * @Assert\Length(min=3, max=50)
     */
    private $fullname;

    /**
     * @Assert\NotBlank()
     * @Assert\Email()
     */
    private $email;

    /**
     * @Assert\NotBlank()
     * @Assert\Regex(
     *     pattern="/^(6\d{8}|2376\d{8})$/",
     *     message="Le numéro doit être au format 6XX... ou 2376..."
     * )
     * @Assert\Length(min=9, max=12)
     */
    private $phone;

    /**
     * @Assert\NotBlank()
     * @Assert\Date()
     * @Assert\LessThan("today")
     */
    private $birthdate;

    /**
     * @Assert\NotBlank()
     */
    private $address;

    // Getters et setters
    public function getFullname() { return $this->fullname; }
    public function setFullname($fullname) { $this->fullname = $fullname; }

    public function getEmail() { return $this->email; }
    public function setEmail($email) { $this->email = $email; }

    public function getPhone() { return $this->phone; }
    public function setPhone($phone) { $this->phone = $phone; }

    public function getBirthdate() { return $this->birthdate; }
    public function setBirthdate($birthdate) { $this->birthdate = $birthdate; }

    public function getAddress() { return $this->address; }
    public function setAddress($address) { $this->address = $address; }
} 