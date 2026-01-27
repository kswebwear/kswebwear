export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto prose prose-invert prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
                <h1 className="text-5xl mb-12">Privacy Policy</h1>
                <p className="text-xl text-white/60 mb-8 font-light">Last Updated: January 2026</p>

                <section className="space-y-6">
                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Information We Collect</h2>
                    <p className="text-white/60 leading-relaxed">
                        We collect information you provide directly to us when you make a purchase, create an account, or contact us. This includes your name, email address, shipping address, and payment information processed securely via Stripe.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">How We Use Your Information</h2>
                    <p className="text-white/60 leading-relaxed">
                        We use your data to process orders, communicate about shipments, and occasionally send promotional materials if you've opted in. We never sell your personal data to third parties.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Security</h2>
                    <p className="text-white/60 leading-relaxed">
                        We implement industry-standard security measures to protect your personal information. All financial transactions are handled by Stripe, and we do not store full credit card details on our servers.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Contact Us</h2>
                    <p className="text-white/60 leading-relaxed pb-20">
                        If you have any questions about this Privacy Policy, please contact us at contact@kswebwear.com.au.
                    </p>
                </section>
            </div>
        </div>
    );
}
