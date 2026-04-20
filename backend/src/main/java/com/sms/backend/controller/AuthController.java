package com.sms.backend.controller;


import com.sms.backend.dto.AuthenticationRequest;
import com.sms.backend.dto.AuthenticationResponse;
import com.sms.backend.entity.User;

import com.sms.backend.security.JwtUtil;
import com.sms.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userService.getUserByUsername(request.getUsername());

        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthenticationResponse(token, user.getRole().name());
    }
}
