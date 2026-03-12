package com.safelight.controller;

import com.safelight.dto.LoginRequest;
import com.safelight.dto.SignupRequest;
import com.safelight.dto.UserResponse;
import com.safelight.model.User;
import com.safelight.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpSession session;

    @InjectMocks
    private AuthController authController;

    @Test
    void signupShouldReturnConflictWhenEmailAlreadyRegistered() {
        SignupRequest request = buildSignupRequest();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(buildUser(1, request.getEmail(), "secret")));

        ResponseEntity<?> response = authController.signup(request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Email is already registered", response.getBody());
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void signupShouldCreateUserWhenEmailIsNew() {
        SignupRequest request = buildSignupRequest();
        User savedUser = buildUser(12, request.getEmail(), request.getPassword());
        savedUser.setFname(request.getFname());
        savedUser.setLname(request.getLname());
        savedUser.setPhone(request.getPhone());
        savedUser.setRole("USER");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(savedUser);

        ResponseEntity<?> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        UserResponse body = assertInstanceOf(UserResponse.class, response.getBody());
        assertEquals(12, body.getId());
        assertEquals(request.getEmail(), body.getEmail());
        assertEquals("USER", body.getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User toSave = userCaptor.getValue();
        assertEquals(request.getFname(), toSave.getFname());
        assertEquals(request.getLname(), toSave.getLname());
        assertEquals(request.getEmail(), toSave.getEmail());
        assertEquals(request.getPassword(), toSave.getPassword());
        assertEquals(request.getPhone(), toSave.getPhone());
        assertEquals(request.getDob(), toSave.getDob());
        assertEquals(request.getCountry(), toSave.getCountry());
        assertEquals("USER", toSave.getRole());
    }

    @Test
    void loginShouldReturnUnauthorizedWhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("secret");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(request, session);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
        verify(session, never()).setAttribute(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void loginShouldReturnUnauthorizedWhenPasswordIsWrong() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrong");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(buildUser(3, request.getEmail(), "correct")));

        ResponseEntity<?> response = authController.login(request, session);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
        verify(session, never()).setAttribute(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void loginShouldSetSessionAndReturnUserWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("correct");
        User user = buildUser(7, request.getEmail(), "correct");
        user.setFname("John");
        user.setLname("Doe");
        user.setPhone("1234567890");
        user.setRole("USER");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<?> response = authController.login(request, session);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        UserResponse body = assertInstanceOf(UserResponse.class, response.getBody());
        assertEquals(7, body.getId());
        assertEquals("john@example.com", body.getEmail());
        verify(session).setAttribute("USER_ID", 7);
    }

    @Test
    void currentUserShouldReturnUnauthorizedWhenNoSessionUserId() {
        when(session.getAttribute("USER_ID")).thenReturn(null);

        ResponseEntity<?> response = authController.currentUser(session);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Not logged in", response.getBody());
    }

    @Test
    void currentUserShouldReturnUnauthorizedWhenSessionUserIdIsNotInteger() {
        when(session.getAttribute("USER_ID")).thenReturn("7");

        ResponseEntity<?> response = authController.currentUser(session);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Not logged in", response.getBody());
    }

    @Test
    void currentUserShouldReturnUnauthorizedWhenUserNotFound() {
        when(session.getAttribute("USER_ID")).thenReturn(404);
        when(userRepository.findById(404)).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.currentUser(session);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Not logged in", response.getBody());
    }

    @Test
    void currentUserShouldReturnUserWhenSessionAndUserAreValid() {
        User user = buildUser(11, "active@example.com", "secret");
        user.setFname("Active");
        user.setLname("User");
        user.setPhone("5551234");
        user.setRole("USER");
        when(session.getAttribute("USER_ID")).thenReturn(11);
        when(userRepository.findById(11)).thenReturn(Optional.of(user));

        ResponseEntity<?> response = authController.currentUser(session);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        UserResponse body = assertInstanceOf(UserResponse.class, response.getBody());
        assertEquals(11, body.getId());
        assertEquals("active@example.com", body.getEmail());
        assertEquals("USER", body.getRole());
        assertNull(user.getCountry());
    }

    @Test
    void logoutShouldInvalidateSessionAndReturnNoContent() {
        ResponseEntity<Void> response = authController.logout(session);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(session).invalidate();
    }

    private SignupRequest buildSignupRequest() {
        SignupRequest request = new SignupRequest();
        request.setFname("Jane");
        request.setLname("Doe");
        request.setEmail("jane@example.com");
        request.setPassword("secret");
        request.setPhone("1234567890");
        request.setDob(LocalDate.of(1995, 3, 10));
        request.setCountry("USA");
        return request;
    }

    private User buildUser(int id, String email, String password) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword(password);
        return user;
    }
}
