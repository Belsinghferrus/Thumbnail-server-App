import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URI,
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                email: profile.emails[0].value
            })
            if(!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    isAOauthUser: true
                });
                await user.save();
                
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

export default passport;
