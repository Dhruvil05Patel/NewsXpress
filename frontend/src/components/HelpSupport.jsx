// HelpSupport: user assistance hub with locked profile autofill and countdown
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { postData } from "../services/api";
import notify from "../utils/toast";
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
  const [submitting, setSubmitting] = useState(false);

  // Update page title
  useEffect(() => {
    document.title = "Help & Support | NewsXpress";
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure submission uses the locked profile values
    const payload = {
      name: profile?.full_name || firebaseUser?.displayName || formData.name,
      email: profile?.email || firebaseUser?.email || formData.email,
      message: formData.message,
    };

    try {
      setSubmitting(true);
      await postData("/api/support/request", payload);
      notify.success("Support request submitted. Check your email.");
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit support request:", error);
      notify.error("Failed to submit support request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg border"
              style={{
                background: "linear-gradient(135deg,#fff,#ffe6ec)",
                borderColor: "#ffb1c1",
              }}
            >
              <HelpCircle
                className="w-6 h-6"
                style={{
                  background: "linear-gradient(135deg,#ff1e1e,#ff4d4d,#ff0066)",
                  WebkitBackgroundClip: "text",
                  color: "red",
                }}
              />
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
                    disabled={submitting}
                    className="w-full text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 40%,#ff0066 85%)",
                      boxShadow:
                        "0 4px 14px -2px rgba(255,0,80,0.45),0 2px 6px -1px rgba(0,0,0,0.25)",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit"}
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
