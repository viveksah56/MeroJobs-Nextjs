# Backend Token Refresh Implementation (Java)

This guide shows how to implement the token refresh endpoint in your Java Spring Boot backend to work with the frontend's automatic token refresh mechanism.

---

## Overview

The frontend expects:
1. **Login response** with both `token` (access) and `refreshToken` (refresh)
2. **Refresh endpoint** that accepts refresh token and returns new tokens
3. **Proper 401 handling** when tokens are invalid/expired

---

## Implementation Steps

### Step 1: Create Token Response DTO

```java
// TokenResponseDto.java
@Data
@Builder
public class TokenResponseDto {
    private String token;           // Access token (short-lived)
    private String refreshToken;    // Refresh token (long-lived)
    private String type = "Bearer";
    private long expiresIn;         // Token expiry in milliseconds
    
    public static TokenResponseDto from(
        String token, 
        String refreshToken, 
        long expiresIn
    ) {
        return TokenResponseDto.builder()
            .token(token)
            .refreshToken(refreshToken)
            .expiresIn(expiresIn)
            .build();
    }
}
```

### Step 2: Create Refresh Request DTO

```java
// RefreshTokenRequestDto.java
@Data
@Validated
public class RefreshTokenRequestDto {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
```

### Step 3: Create JWT Token Provider

```java
// JwtTokenProvider.java
@Component
@Configuration
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;
    
    @Value("${jwt.refresh-expiration:86400000}")
    private long refreshTokenExpirationMs;
    
    /**
     * Generate access token
     */
    public String generateAccessToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .claim("role", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()))
            .claim("name", userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    /**
     * Generate refresh token
     */
    public String generateRefreshToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    /**
     * Extract username from token
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Get expiration time in milliseconds
     */
    public long getAccessTokenExpirationMs() {
        return jwtExpirationMs;
    }
}
```

### Step 4: Create Authentication Controller

```java
// AuthController.java
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Login endpoint - returns both access and refresh tokens
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails.getUsername());
            
            // Store refresh token in database (optional but recommended)
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
            
            // Build response
            TokenResponseDto tokenResponse = TokenResponseDto.from(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs()
            );
            
            UserResponseDto userResponse = mapToUserResponse(user);
            
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                new LoginResponseDto(tokenResponse, userResponse),
                "Login successful"
            ));
            
        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user: {}", request.getEmail());
            return ResponseEntity.status(401).body(new ApiResponse<>(
                false,
                null,
                "Invalid email or password"
            ));
        }
    }
    
    /**
     * Refresh token endpoint - returns new access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        try {
            // Validate refresh token
            if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
                return ResponseEntity.status(401).body(new ApiResponse<>(
                    false,
                    null,
                    "Invalid or expired refresh token"
                ));
            }
            
            // Extract username from refresh token
            String username = jwtTokenProvider.getUsernameFromToken(request.getRefreshToken());
            
            // Find user
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            // Verify refresh token matches stored token
            if (!user.getRefreshToken().equals(request.getRefreshToken())) {
                return ResponseEntity.status(401).body(new ApiResponse<>(
                    false,
                    null,
                    "Refresh token mismatch"
                ));
            }
            
            // Generate new access token
            String newAccessToken = jwtTokenProvider.generateAccessToken(
                new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    getAuthorities(user)
                )
            );
            
            // Generate new refresh token
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
            
            // Update refresh token in database
            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);
            
            // Build response
            TokenResponseDto tokenResponse = TokenResponseDto.from(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs()
            );
            
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                tokenResponse,
                "Token refreshed successfully"
            ));
            
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.status(401).body(new ApiResponse<>(
                false,
                null,
                "Token refresh failed"
            ));
        }
    }
    
    /**
     * Logout endpoint - invalidates refresh token
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            // Clear refresh token
            user.setRefreshToken(null);
            userRepository.save(user);
            
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                null,
                "Logout successful"
            ));
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                null,
                "Logout successful"
            ));
        }
    }
    
    /**
     * Verify token endpoint
     */
    @GetMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyToken(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            mapToUserResponse(user),
            "Token is valid"
        ));
    }
    
    private UserResponseDto mapToUserResponse(User user) {
        return UserResponseDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().name())
            .build();
    }
    
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }
}
```

### Step 5: Update User Entity

```java
// User.java (JPA Entity)
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String firstName;
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.EMPLOYEE;
    
    // Store refresh token to invalidate on logout
    @Column(columnDefinition = "TEXT")
    private String refreshToken;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### Step 6: Create JWT Authentication Filter

```java
// JwtAuthenticationFilter.java
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // Get token from Authorization header
            String jwt = getJwtFromRequest(request);
            
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                String username = jwtTokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### Step 7: Security Configuration

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .exceptionHandling()
            .authenticationEntryPoint(new RestAuthenticationEntryPoint())
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeRequests()
            .antMatchers("/auth/login", "/auth/register").permitAll()
            .antMatchers("/auth/refresh").permitAll()
            .anyRequest().authenticated();
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
```

### Step 8: Application Properties

```properties
# application.properties or application.yml

# JWT Configuration
jwt.secret=your_very_long_secret_key_with_special_characters_12345
jwt.expiration=3600000              # 1 hour in milliseconds
jwt.refresh-expiration=86400000     # 24 hours in milliseconds

# CORS Configuration
cors.allowedOrigins=http://localhost:3000,http://localhost:3001
cors.allowedMethods=GET,POST,PUT,DELETE,OPTIONS
cors.allowedHeaders=*
cors.allowCredentials=true
cors.maxAge=3600

# API Configuration
server.servlet.context-path=/api/v1
server.port=8000
```

---

## Response Examples

### Login Response (200)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "expiresIn": 3600000,
    "user": {
      "id": 1,
      "email": "user@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  },
  "message": "Login successful"
}
```

### Refresh Response (200)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "expiresIn": 3600000
  },
  "message": "Token refreshed successfully"
}
```

### Error Response (401)
```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired refresh token"
}
```

---

## Testing

### Test Refresh Endpoint

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'

# Response contains:
# "token": "access_token_here",
# "refreshToken": "refresh_token_here"

# 2. Refresh token
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token_here"
  }'

# Response contains new access token
```

---

## Security Checklist

- [ ] Refresh token stored in database (allows invalidation)
- [ ] Refresh token cleared on logout
- [ ] Access token has short expiry (1 hour)
- [ ] Refresh token has long expiry (24 hours)
- [ ] Tokens signed with strong secret (min 32 characters)
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints
- [ ] JWT validation on all protected endpoints
- [ ] Password hashed with bcrypt
- [ ] Sensitive endpoints require authentication

---

## Common Issues

### Issue 1: Frontend keeps logging out
**Cause:** Refresh token not returned from login
**Solution:** Ensure login endpoint returns both `token` and `refreshToken`

### Issue 2: 401 errors not being handled
**Cause:** JWT validation failing
**Solution:** Check JWT secret matches between frontend .env and backend properties

### Issue 3: Token not expiring
**Cause:** Expiration claim missing from JWT
**Solution:** Ensure `setExpiration()` is called in token generation

### Issue 4: Refresh returns 401
**Cause:** Stored refresh token doesn't match
**Solution:** Verify refresh token is being saved to database and retrieved correctly

---

## Complete Flow Diagram

```
Frontend                    Backend
   │                          │
   │──── POST /login ────────→│
   │                          │
   │←─ tokens + user ────────│
   │   (store in cookies)    │
   │                          │
   │ (Makes request)          │
   │──── GET /jobs ──────────→│
   │  Authorization: Bearer   │
   │                          │
   │←─ 200 Jobs ────────────│
   │                          │
   │ (After 1 hour...)        │
   │──── GET /jobs ──────────→│
   │  Authorization: Bearer   │
   │  (expired token)         │
   │                          │
   │←─ 401 Unauthorized ────│
   │                          │
   │ (Auto refresh)           │
   │──── POST /refresh ─────→│
   │  refreshToken            │
   │                          │
   │←─ new access token ────│
   │   (update cookie)        │
   │                          │
   │──── GET /jobs ──────────→│
   │  Authorization: Bearer   │
   │  (new token)             │
   │                          │
   │←─ 200 Jobs ────────────│
```

---

Everything is now configured for automatic token refresh! 🚀

EOF
cat /vercel/share/v0-project/BACKEND_TOKEN_REFRESH_IMPLEMENTATION.md
