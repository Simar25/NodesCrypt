import React, { useEffect, useRef } from 'react';
import './BlockchainAnimation.css';

const BlockchainAnimation = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation parameters
        const centerX = () => canvas.width / 2;
        const centerY = () => canvas.height / 2;
        const globeRadius = 180;

        // Network nodes
        const nodes = [];
        const nodeCount = 12;
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = globeRadius + 60 + Math.random() * 40;
            nodes.push({
                angle: angle,
                radius: radius,
                size: 8 + Math.random() * 4,
                pulseOffset: Math.random() * Math.PI * 2,
                orbitSpeed: 0.0005 + Math.random() * 0.001
            });
        }

        // Particles
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 1 + Math.random() * 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5
            });
        }

        // Draw globe wireframe
        const drawGlobe = (rotation) => {
            ctx.save();
            ctx.translate(centerX(), centerY());

            // Draw latitude lines
            for (let i = -2; i <= 2; i++) {
                const y = (i / 2) * globeRadius * 0.8;
                const radius = Math.sqrt(globeRadius * globeRadius - y * y);

                ctx.beginPath();
                ctx.ellipse(0, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 242, 255, ${0.15 + Math.abs(i) * 0.05})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Draw longitude lines
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI + rotation;

                ctx.beginPath();
                ctx.save();
                ctx.rotate(angle);
                ctx.ellipse(0, 0, globeRadius, globeRadius * 0.3, 0, 0, Math.PI * 2);
                ctx.restore();
                ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            ctx.restore();
        };

        // Draw network nodes
        const drawNodes = (rotation) => {
            nodes.forEach((node, index) => {
                node.angle += node.orbitSpeed;

                const x = centerX() + Math.cos(node.angle + rotation) * node.radius;
                const y = centerY() + Math.sin(node.angle + rotation) * node.radius;

                // Pulsing effect
                const pulse = Math.sin(time * 0.003 + node.pulseOffset) * 0.3 + 1;
                const size = node.size * pulse;

                // Glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                gradient.addColorStop(0, 'rgba(0, 242, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(0, 242, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = '#00f2ff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();

                // Store position for connections
                node.x = x;
                node.y = y;
            });
        };

        // Draw connections between nodes
        const drawConnections = () => {
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const distance = Math.sqrt(
                        Math.pow(nodes[i].x - nodes[j].x, 2) +
                        Math.pow(nodes[i].y - nodes[j].y, 2)
                    );

                    if (distance < 250) {
                        const pulse = Math.sin(time * 0.002 + i + j) * 0.5 + 0.5;
                        ctx.strokeStyle = `rgba(0, 242, 255, ${0.1 * pulse})`;

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Draw Bitcoin logo
        const drawBitcoinLogo = () => {
            ctx.save();
            ctx.translate(centerX(), centerY());

            // Bitcoin circle
            const logoSize = 50;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, logoSize);
            gradient.addColorStop(0, 'rgba(247, 147, 26, 0.9)');
            gradient.addColorStop(1, 'rgba(247, 147, 26, 0.6)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, logoSize, 0, Math.PI * 2);
            ctx.fill();

            // Bitcoin symbol (simplified)
            ctx.strokeStyle = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('₿', 0, 0);

            // Glow ring
            ctx.strokeStyle = 'rgba(247, 147, 26, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, logoSize + 5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        };

        // Draw particles
        const drawParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2
                );
                gradient.addColorStop(0, `rgba(0, 242, 255, ${particle.opacity})`);
                gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Main animation loop
        const animate = () => {
            time++;
            const rotation = time * 0.001;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all elements
            drawParticles();
            drawGlobe(rotation);
            drawConnections();
            drawNodes(rotation);
            drawBitcoinLogo();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <div className="blockchain-animation-container">
            <canvas ref={canvasRef} className="blockchain-canvas" />
        </div>
    );
};

export default BlockchainAnimation;
