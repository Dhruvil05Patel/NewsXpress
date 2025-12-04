import React, { useEffect } from "react";
import { Github, Linkedin, Mail, ExternalLink, Code2 } from "lucide-react";

// Developers: Team information page
export default function Developers() {
    // Set document title for this page
    useEffect(() => {
        document.title = "Developers | NewsXpress";
    }, []);
    const developers = [
        {
            name: "Patel Dhruvil",
            image: "/Dhruvil.jpg",
            github: "https://github.com/Dhruvil05Patel",
            linkedin: "https://www.linkedin.com/in/dhruvil05patel",
            email: "dhruvil1405patel@gmail.com",
        },
        {
            name: "Gandhi Tirth",
            image: "/TirthG.jpg",
            github: "https://github.com/tirthgandhi9905",
            linkedin: "https://www.linkedin.com/in/tirthgandhi9905",
            email: "gandhitirth604@gmail.com",
        },
        {
            name: "Daiya Jeet",
            image: "/Jeet.jpg",
            github: "https://github.com/JeetDaiya",
            linkedin: "https://www.linkedin.com/in/jeet-daiya-0b4a022b1",
            email: "jeet.a.daiya24@gmail.com",
        },
        {
            name: "Ramoliya Shivam Sureshbhai",
            image: "/Shivam.jpg",
            github: "https://github.com/Shivam-Ramoliya",
            linkedin:
                "https://www.linkedin.com/in/ramoliya-shivam-sureshbhai-753265287",
            email: "shivamramoliya2005@gmail.com",
        },
        {
            name: "Khoyani Maulik",
            image: "/Maulik.jpg",
            github: "https://github.com/Maulik2710",
            linkedin: "https://www.linkedin.com/in/maulik-khoyani-500034299",
            email: "maulikkhoyani2710@gmail.com",
        },
        {
            name: "Boghani Tirth",
            image: "/TirthB.jpg",
            github: "https://github.com/TirthB01",
            linkedin: "https://www.linkedin.com/in/tirth-boghani-64b555322",
            email: "boghanitirth@gmail.com",
        },
        {
            name: "Vyas Kartik",
            image: "/Kartik.jpg",
            github: "https://github.com/KartikVyas1925",
            linkedin: "https://www.linkedin.com/in/kartik-vyas-6b133b31b",
            email: "vyaskartik192@gmail.com",
        },
        {
            name: "Thummar Jeel",
            image: "/Jeel.jpg",
            github: "https://github.com/Jeel3011",
            linkedin: "https://www.linkedin.com/in/jeel-thummar-968742284",
            email: "jeel15thummar@gmail.com",
        },
        {
            name: "Padaliya Vansh",
            image: "/Vansh.jpg",
            github: "https://github.com/vanshkpadaliya",
            linkedin: "https://www.linkedin.com/in/vansh-padaliya-2779b7282",
            email: "vanshpadaliya05@gmail.com",
        },
        {
            name: "Dabhi Vrajesh",
            image: "/Vrajesh.jpg",
            github: "https://github.com/VrajeshDabhi",
            linkedin: "https://www.linkedin.com/in/vrajesh-dabhi",
            email: "hydabhi96@gmail.com",
        },
    ];

    const gradientStyle = {
        background:
            "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-24 lg:pb-8 px-4">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Code2 className="w-8 h-8 text-red-600" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            Team NewsXpress
                        </h1>
                        <Code2 className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A collaborative group of engineers and problem‑solvers building an
                        AI‑powered, accessible, and delightful news experience — fast,
                        reliable, and personal.
                    </p>
                </div>

                {/* Developer Cards Grid - responsive: 1 col small, 2 cols medium, 5 cols large */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {developers.map((dev, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Card Header with Gradient */}
                            <div className="h-60 relative" style={gradientStyle}>
                                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                                    <div className="w-70 h-70 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                        <img
                                            src={dev.image}
                                            alt={dev.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "/default-avatar.png";
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="pt-24 pb-6 px-4 text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {dev.name}
                                </h3>

                                {/* Social Links */}
                                <div className="flex justify-center gap-2 mt-4">
                                    <a
                                        href={dev.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-800 hover:text-white text-gray-700 transition-colors duration-200"
                                        aria-label="GitHub Profile"
                                        title="GitHub"
                                    >
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={dev.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 transition-colors duration-200"
                                        aria-label="LinkedIn Profile"
                                        title="LinkedIn"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={`mailto:${dev.email}`}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 transition-colors duration-200"
                                        aria-label="Send Email"
                                        title="Email"
                                    >
                                        <Mail className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Project Info Section */}
                <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Code2 className="w-6 h-6 text-red-600" />
                        About NewsXpress
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        NewsXpress is an AI‑powered, personalized news platform that
                        curates, summarizes, and delivers relevant stories in real time.
                        This project was developed for the IT314 Software Engineering course
                        at DA‑IICT under the guidance of Prof. Saurabh Tiwari. Our mission
                        is simple: help readers stay informed — quickly and meaningfully.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Technology Stack
                                </h3>
                                <p className="text-sm text-gray-600">
                                    React, Vite, Tailwind CSS, Node.js/Express, PostgreSQL,
                                    Firebase (Auth & Cloud Messaging), Python (Flask),
                                    scikit‑learn, etc.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Key Features
                                </h3>
                                <p className="text-sm text-gray-600">
                                    AI summarization, reel‑style reading view with multilingual
                                    support, ML‑driven recommendations, text‑to‑speech (TTS), live
                                    updates, etc.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">University</h3>
                                <p className="text-sm text-gray-600">DA-IICT, Gandhinagar.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Course</h3>
                                <p className="text-sm text-gray-600">
                                    IT314 - Software Engineering.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Guidance</h3>
                                <p className="text-sm text-gray-600">
                                    Faculty mentor: Prof. Saurabh Tiwari.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Principles</h3>
                                <p className="text-sm text-gray-600">
                                    User‑first design, privacy by default, accessibility,
                                    reliability, and performance.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <a
                            href="https://github.com/Dhruvil05Patel/NewsXpress"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                            style={gradientStyle}
                        >
                            <Github className="w-5 h-5" />
                            View on GitHub
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
