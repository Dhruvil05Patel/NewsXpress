// HelpSupport: user assistance hub with locked profile autofill and countdown
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    HelpCircle,
    CheckCircle2,
    Mail,
    MessageSquare,
    ExternalLink,
} from "lucide-react";

const HelpSupport = () => {
    const { user: firebaseUser, profile } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // After showing success, display countdown and return to form
    useEffect(() => {
        if (!submitted) return;
        setCountdown(10);

        const intervalId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    setSubmitted(false);
                    setFormData((p) => ({ ...p, message: "" }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [submitted]);

    // Sync locked fields (name, email) from authenticated profile
    useEffect(() => {
        const lockedName = profile?.full_name || firebaseUser?.displayName || "";
        const lockedEmail = profile?.email || firebaseUser?.email || "";
        setFormData((prev) => ({ ...prev, name: lockedName, email: lockedEmail }));
    }, [
        profile?.full_name,
        profile?.email,
        firebaseUser?.displayName,
        firebaseUser?.email,
    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Only allow changing message; name/email are locked from profile
        if (name === "message") {
            setFormData((prev) => ({ ...prev, message: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure submission uses the locked profile values
        const payload = {
            name: profile?.full_name || firebaseUser?.displayName || formData.name,
            email: profile?.email || firebaseUser?.email || formData.email,
            message: formData.message,
        };
        console.log("📩 Form Submitted Data:", payload);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                            <HelpCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Help & Support
                            </h1>
                            <p className="text-sm text-gray-600">
                                We’re here to help. Reach out anytime.
                            </p>
                        </div>
                    </div>
                </div>

                {!submitted ? (
                    <div className="flex justify-center">
                        {/* Contact Form */}
                        <section className="w-full max-w-2xl sm:max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Contact support
                            </h2>
                            <p className="text-base text-gray-600 mb-6">
                                Fill out the form and our team will get back to you soon.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        readOnly
                                        disabled
                                        aria-readonly="true"
                                        required
                                        className="w-full px-3 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                        aria-readonly="true"
                                        required
                                        className="w-full px-3 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        rows="8"
                                        placeholder="How can we help?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 outline-none resize-y focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Submit
                                    </button>
                                    <p className="text-xs text-gray-500 text-center">
                                        We usually respond within 24 hours.
                                    </p>
                                </div>
                            </form>
                        </section>
                    </div>
                ) : (
                    <div className="max-w-2xl sm:max-w-3xl mx-auto px-4">
                        <div className="bg-white rounded-2xl border border-green-200 shadow-lg p-8 text-center">
                            <div className="flex justify-center mb-3">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                Message sent
                            </h3>
                            <p className="text-base text-gray-600">
                                Thanks for reaching out! Your message has been printed in the
                                console for this demo. We’ll get back to you shortly.
                            </p>
                            <p className="text-sm text-gray-500 mt-3">
                                Returning to the form in {countdown} sec.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpSupport;
