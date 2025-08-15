/**
 * Authentication Controllers
 * 
 * Handles session management:
 * - Session creation (login)
 * - Session termination (logout)
 * - User profile retrieval
 * 
 * Security Features:
 * - HTTP-only cookies for session tokens
 * - SameSite strict policy
 * - Secure flag in production
 */
import admin from '../config/firebase.js';
import User from '../models/userModel.js';

/**
 * Create user session
 * 
 * 1. Verifies Firebase ID token
 * 2. Creates/updates user in database
 * 3. Sets HTTP-only session cookie
 */
export const createSession = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({
            error: "Missing authentication token",
            code: "MISSING_TOKEN"
        });
    }

    try {
        // verify the token with firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        // create or update the user in database
        const user = await User.findOneAndUpdate(
            { uid: decodedToken.uid },
            {
                email: decodedToken.email,
                name: decodedToken.name || "",
                profilePicture: decodedToken.picture || "",
                lastLogin: new Date(),
                $setOnInsert: {
                    // default values for new users
                    roles: ['patient'],
                    createdAt: new Date()
                }
            },
            { upsert: true, new: true, runValidators: true }
        );
        //set saecure the HTTP-only cookie
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1hr (60mins)
            path: '/'
        });

        res.status(200).json({
            message: "Session established",
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                roles: user.roles,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error("Session creattion error:", error);
        res.status(401).json({
            error: "Invalid authentication token",
            code: "INVALID_TOKEN"
        });
    }
};

/**
 * Terminate user session
 */
export const terminateSession = (req, res) => {
    res.clearCookie('session', {
        httpOnly: true,
        secure: proccess.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
});

res.status(200).json({ message: "Session terminated" });
};


/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });

        if (!user) {
            return res.status(404).json({
                error: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        res.status(200).json({
            uid: user.uid,
            email: user.email,
            name: user.name,
            roles: user.roles,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error("Profile retrieval error:", error);
        res.status(500).json({
            error: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};