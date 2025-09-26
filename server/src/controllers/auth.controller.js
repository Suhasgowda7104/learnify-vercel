import authService from '../services/auth.services.js';

// Register a new student
export const register = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await authService.registerStudent(userData);

        res.status(201).json({
            message: 'Student registered successfully',
            success: true,
            data: newUser
        });
    } catch (error) {
        console.log(error);
        
        // Handle specific validation errors
        if (error.message === 'All fields are required' || 
            error.message === 'User already exists with this email') {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
        
        if (error.message === 'Student role not found in system') {
            return res.status(500).json({
                message: error.message,
                success: false
            });
        }

        res.status(500).json({
            message: 'Error registering student',
            success: false
        });
    }
};

// Authenticate user and return JWT
export const login = async (req, res) => {
    try {
        const credentials = req.body;
        const authResult = await authService.authenticateUser(credentials);

        res.status(200).json({
            message: 'Login successful',
            success: true,
            data: authResult
        });
    } catch (error) {
        console.log(error);
        
        // Handle specific authentication errors
        if (error.message === 'Email and password are required') {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
        
        if (error.message === 'Invalid email or password' || 
            error.message === 'Account is not active') {
            return res.status(401).json({
                message: error.message,
                success: false
            });
        }

        res.status(500).json({
            message: 'Error during login',
            success: false
        });
    }
};

// Invalidate user token/session (client-side logout)
export const logout = async (req, res) => {
    try {
        // Since we're using JWT tokens, logout is handled client-side
        // by removing the token from client storage
        res.status(200).json({
            message: 'Logout successful',
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error during logout',
            success: false
        });
    }
};