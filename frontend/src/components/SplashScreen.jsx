import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  // Simulation du chargement
  useEffect(() => {
    let interval;
    const startTime = Date.now();
    const duration = 2000; // 2 secondes

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        clearInterval(interval);
        setTimeout(onFinish, 400);
      }
    };

    interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-carbon flex flex-col items-center justify-center overflow-hidden"
      role="status"
      aria-label="Chargement de l'application"
    >
      {/* Halo lumineux en arrière-plan */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-crimson/20 blur-[120px] opacity-30"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gold/20 blur-[100px] opacity-20 mt-32"></div>

      {/* Logo avec effet "Scan" */}
      <div className="relative flex flex-col items-center">
        <motion.img
          src="/src/assets/logo.png"
          alt="Black Box"
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-32 md:w-40 object-contain drop-shadow-[0_0_25px_rgba(197,160,89,0.6)]"
        />

        {/* Trait de lumière qui traverse le logo */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ mixBlendMode: "overlay" }}
        ></motion.div>
      </div>

      {/* Texte "BLACK BOX" stylisé */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 font-display text-2xl md:text-3xl font-black tracking-[0.3em] text-offwhite"
      >
        BLACK <span className="text-gold">BOX</span>
      </motion.h1>

      {/* Barre de progression cinéma */}
      <div className="mt-10 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-crimson to-gold rounded-full"
          style={{ width: `${Math.round(progress)}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>

      {/* Compteur de progression */}
      <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">
        {progress < 100 ? `Chargement... ${Math.round(progress)}%` : "Prêt à briller ✨"}
      </p>

      {/* Effet de grain de pellicule */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')"
        }}
      ></div>
    </motion.div>
  );
};

export default SplashScreen;