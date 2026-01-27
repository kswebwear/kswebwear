export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto prose prose-invert prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
                <h1 className="text-5xl mb-12">Terms of Service</h1>
                <p className="text-xl text-white/60 mb-8 font-light">Last Updated: January 2026</p>

                <section className="space-y-6">
                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Acceptance of Terms</h2>
                    <p className="text-white/60 leading-relaxed">
                        By using the KSWebWear website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Custom Orders</h2>
                    <p className="text-white/60 leading-relaxed">
                        All custom apparel orders are final once production begins. It is the customer's responsibility to ensure that designs and spelling are correct before submission.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Shipping & Delivery</h2>
                    <p className="text-white/60 leading-relaxed">
                        We ship across Australia. Delivery times are estimates and not guarantees. We are not responsible for delays caused by shipping carriers.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Intellectual Property</h2>
                    <p className="text-white/60 leading-relaxed">
                        Customers represent that they have the right to use any designs provided for printing. KSWebWear reserves the right to refuse orders containing offensive or copyright-infringing content.
                    </p>

                    <h2 className="text-2xl mt-12 border-l-4 border-primary pl-4">Governing Law</h2>
                    <p className="text-white/60 leading-relaxed pb-20">
                        These terms are governed by the laws of Australia and the state of Victoria.
                    </p>
                </section>
            </div>
        </div>
    );
}
