import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const FormInput = ({ icon, type, placeholder, value, onChange, required }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 transition-colors"
            />
        </div>
    );
};

const NativeVideoBackground = ({ videoSrc }) => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-70"
                src={videoSrc}
            />
        </div>
    );
};

const LoginForm = ({ onSubmit, isSubmitting, isLogin = true, onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSubmit(email, password);
        if (success) {
            setIsSuccess(true);
        }
    };

    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10 shadow-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-6 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-red-600/30 via-red-500/30 to-orange-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white tracking-widest uppercase">
                        PITWALL
                    </span>
                </h2>
                
                {/* Mode Toggle Tabs */}
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 mb-6 max-w-xs mx-auto">
                    <button
                        type="button"
                        onClick={() => !isLogin && onToggleMode()}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            isLogin 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => isLogin && onToggleMode()}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            !isLogin 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative text-sm font-medium tracking-wide">
                        {isLogin ? 'Enter the telemetry grid' : 'Register your access credentials'}
                    </span>
                    <span className="text-xs text-white/50 pt-2 pb-1 animate-pulse font-mono">
                        {isLogin ? '[Authorize secure connection]' : '[Initialize new operator profile]'}
                    </span>
                    <div className="flex space-x-3 text-xs text-red-500/60 mt-1">
                        <span className="animate-pulse">🏁</span>
                        <span>🏎️</span>
                        <span className="animate-pulse">⏱️</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    icon={<Mail className="text-white/60" size={18} />}
                    type="email"
                    placeholder="Operations Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="relative">
                    <FormInput
                        icon={<Lock className="text-white/60" size={18} />}
                        type={showPassword ? "text" : "password"}
                        placeholder="Security Passcode"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`relative overflow-hidden w-full py-3 rounded-lg ${isSuccess ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'} text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 mt-2`}
                >
                    <span className={`relative z-10 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                        {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                        {isLogin ? 'Engage Systems' : 'Request Access'}
                    </span>

                    {isSubmitting && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="absolute inset-0 bg-red-800 opacity-50"></div>
                           <motion.div
                               initial={{ x: -150 }}
                               animate={{ x: [-150, 200] }}
                               transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                               className="absolute z-20 flex items-center gap-2"
                           >
                               <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,1)]">🏎️</span>
                               <span className="text-[10px] font-mono italic font-bold tracking-widest text-white animate-pulse">
                                   {isLogin ? 'WARMING TYRES...' : 'REGISTERING...'}
                               </span>
                           </motion.div>
                        </div>
                    )}
                </button>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onToggleMode}
                        className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const YoutubeBackground = ({ videoId }) => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            <iframe
                className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&disablekb=1&playsinline=1`}
                title="YouTube background"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ filter: 'brightness(0.7)' }}
            />
        </div>
    );
};

const GamingLoginSettings = {
    LoginForm,
    YoutubeBackground,
    NativeVideoBackground
};

export default GamingLoginSettings;
