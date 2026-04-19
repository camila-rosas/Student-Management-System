package com.sms.backend.controller;


import com.sms.backend.entity.User;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import static com.sms.backend.entity.Role.STUDENT;


@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginRequest){
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (loginRequest.getPassword() == null || !user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid Credentials!");
        }
        return jwtUtil.generateToken(user.getUsername());
    }

    @GetMapping("/test")
    public String test() {
        return "OK";
    }

    @PostMapping("/seed")
    public String seed() {
        User user = new User();
        user.setUsername("test");
        user.setPassword("123");
        user.setEmail("test@email.com");
        user.setRole(STUDENT);

        userRepository.save(user);
        return "User created";
    }

}
