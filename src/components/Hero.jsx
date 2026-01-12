import React, { useState, useEffect, useRef } from 'react';
import AnimatedCounter from './AnimatedCounter';
import './Hero.css';

const Hero = ({ onStartSecuring }) => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [scrollY, setScrollY] = useState(0);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const totalFrames = 40;
    const images = useRef([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Observer for stats visibility to trigger animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setStatsVisible(entry.isIntersecting);
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Preload all images
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises = [];
            for (let i = 1; i <= totalFrames; i++) {
                const img = new Image();
                const paddedNum = String(i).padStart(3, '0');
                img.src = `/sequence/ezgif-frame-${paddedNum}.jpg`;
                imagePromises.push(
                    new Promise((resolve) => {
                        img.onload = () => resolve(img);
                    })
                );
                images.current[i - 1] = img;
            }
            await Promise.all(imagePromises);
            setImagesLoaded(true);
        };
        loadImages();
    }, []);

    // Canvas-based rendering with frame interpolation
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const currentImg = images.current[currentFrame - 1];
        const nextFrame = currentFrame >= totalFrames ? 0 : currentFrame;
        const nextImg = images.current[nextFrame];

        if (currentImg && currentImg.complete) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Calculate scaling to cover
            const scale = Math.max(
                canvas.width / currentImg.width,
                canvas.height / currentImg.height
            );

            const x = (canvas.width / 2) - (currentImg.width / 2) * scale;
            const y = (canvas.height / 2) - (currentImg.height / 2) * scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw current frame
            ctx.globalAlpha = 1;
            ctx.drawImage(currentImg, x, y, currentImg.width * scale, currentImg.height * scale);

            // Blend next frame for smooth transition
            if (nextImg && nextImg.complete) {
                ctx.globalAlpha = 0.3;
                ctx.drawImage(nextImg, x, y, nextImg.width * scale, nextImg.height * scale);
            }
            ctx.globalAlpha = 1;
        }
    }, [currentFrame, imagesLoaded]);

    // Auto-play animation with requestAnimationFrame for smoothness
    useEffect(() => {
        let lastTime = 0;
        const frameInterval = 66; // ~15fps with blending for smooth look
        let animationId;

        const animate = (currentTime) => {
            if (currentTime - lastTime >= frameInterval) {
                setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
                lastTime = currentTime;
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, []);

    // Scroll-based effects
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse parallax
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section id="hero" className="hero">
            {/* Canvas-based animated background */}
            <div className="hero-canvas-wrapper">
                <canvas ref={canvasRef} className="hero-canvas"></canvas>
                <div className="canvas-overlay"></div>
            </div>



            {/* Content */}
            <div className="container hero-content" style={{
                transform: `translateY(${scrollY * 0.3}px)`
            }}>
                <div className="hero-badge">
                    <span className="badge-dot"></span>
                    AI-POWERED SECURITY
                </div>

                <h1 className="glitch-text" data-text="NodesCrypt">
                    Nodes<span className="gradient-text">Crypt</span>
                </h1>

                <h2 className="hero-subtitle">
                    First Fully <span className="highlight-text">Autonomous</span>
                    <br />Node-Level Defense Platform
                </h2>

                <p className="hero-description">
                    RL-powered security that monitors, detects, and neutralizes blockchain threats
                    in real-time. Trained on 3M+ attack simulations to protect against Eclipse,
                    Sybil, Double-Spend, and 51% attacks.
                </p>

                {/* Stats bar */}
                <div ref={statsRef} className="stats-bar">
                    <div className="stat-item">
                        <div className="stat-value">
                            <AnimatedCounter end={98} suffix="%" duration={1500} isVisible={statsVisible} />
                        </div>
                        <div className="stat-label">Threat Detection</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">24/7</div>
                        <div className="stat-label">AI Monitoring</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">
                            <AnimatedCounter end={10} prefix="<" suffix="ms" duration={1500} isVisible={statsVisible} />
                        </div>
                        <div className="stat-label">Response Time</div>
                    </div>
                </div>

                <div className="hero-btns">
                    <button className="btn btn-glow" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                        <span className="btn-icon">🛡️</span>
                        Get Started
                    </button>
                    <button className="btn btn-primary" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                        <span className="btn-icon">⚡</span>
                        View Technology
                    </button>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"></div>
                    </div>
                    <span>Scroll to explore</span>
                </div>
            </div>

            {/* Particle system */}
            <div className="particle-system">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            '--delay': `${Math.random() * 5}s`,
                            '--duration': `${5 + Math.random() * 10}s`,
                            '--x': `${Math.random() * 100}%`,
                            '--y': `${Math.random() * 100}%`,
                            '--size': `${2 + Math.random() * 4}px`
                        }}
                    ></div>
                ))}
            </div>
        </section>
    );
};

export default Hero;
