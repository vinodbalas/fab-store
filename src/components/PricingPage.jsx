import { ArrowLeft, Check, Zap, Building2, Crown, Sparkles } from "lucide-react";

export default function PricingPage({ onBack }) {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: "Free",
      period: "Forever",
      description: "Perfect for individuals and small teams getting started",
      features: [
        "Access to published applications",
        "Launch and use up to 3 applications",
        "View FAB Store catalog",
        "Community support",
        "Basic AI Watchtower features",
        "Limited to 100 AI reasoning requests/month",
      ],
      cta: "Get Started",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      name: "Developer",
      icon: Building2,
      price: "$99",
      period: "per month",
      description: "For developers building custom applications",
      features: [
        "Everything in Starter",
        "Unlimited application launches",
        "Access to AppBuilder",
        "Build and edit applications",
        "My Space dashboard",
        "Clone templates",
        "Submit apps for review",
        "5,000 AI reasoning requests/month",
        "Platform component access",
        "Email support",
        "API access",
      ],
      cta: "Start Building",
      popular: true,
      color: "from-[#612D91] to-[#A64AC9]",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Custom",
      period: "Contact us",
      description: "For organizations requiring full platform access and support",
      features: [
        "Everything in Developer",
        "Unlimited AI reasoning requests",
        "Publish applications directly",
        "Publish AI models",
        "Publish platform components",
        "Manage platforms",
        "User management & RBAC",
        "Advanced analytics & reporting",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantees",
        "On-premise deployment options",
        "Custom training & onboarding",
        "Priority feature requests",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  ];

  const addOns = [
    {
      name: "Additional AI Requests",
      description: "Extra AI reasoning requests beyond plan limits",
      price: "$0.01 per request",
    },
    {
      name: "Custom Platform Development",
      description: "Build custom platforms for your industry",
      price: "Custom pricing",
    },
    {
      name: "White-Label Solution",
      description: "Brand the platform with your organization's identity",
      price: "Custom pricing",
    },
    {
      name: "Dedicated Infrastructure",
      description: "Isolated infrastructure for enhanced security and performance",
      price: "Custom pricing",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FF]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#612D91] hover:text-[#7B3DA1] transition-colors mb-4 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Store</span>
          </button>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
              <p className="text-base text-gray-600 mt-0.5">Choose the plan that fits your needs</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto text-sm">
            Transparent, flexible pricing for teams of all sizes. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-xl border-2 ${
                  plan.popular
                    ? `${plan.borderColor} shadow-xl scale-105`
                    : "border-gray-200 shadow-sm"
                } bg-white overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white text-xs font-semibold py-1.5 text-center">
                    Most Popular
                  </div>
                )}
                <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600 text-xs">/{plan.period}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">{plan.description}</p>
                  <button
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all mb-4 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white hover:shadow-lg"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <div className="space-y-2">
                    {plan.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#612D91] shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-ons */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add-ons & Extensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {addOns.map((addOn, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{addOn.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{addOn.description}</p>
                <div className="text-base font-bold text-[#612D91]">{addOn.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Can I change plans later?</h3>
              <p className="text-xs text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any charges.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">What happens if I exceed my AI request limit?</h3>
              <p className="text-xs text-gray-600">
                You can purchase additional AI requests as an add-on, or upgrade to a higher plan. 
                We'll notify you when you're approaching your limit.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Do you offer discounts for annual plans?</h3>
              <p className="text-xs text-gray-600">
                Yes, annual plans receive a 20% discount. Contact our sales team for Enterprise annual pricing.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Is there a free trial for paid plans?</h3>
              <p className="text-xs text-gray-600">
                Developer plan includes a 14-day free trial. Enterprise plans include a 30-day evaluation period 
                with full support.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">What payment methods do you accept?</h3>
              <p className="text-xs text-gray-600">
                We accept all major credit cards, ACH transfers, and wire transfers for Enterprise plans. 
                All payments are processed securely.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Can I get a custom quote?</h3>
              <p className="text-xs text-gray-600">
                Absolutely. Contact our sales team for custom pricing based on your specific requirements, 
                volume discounts, or special use cases.
              </p>
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="bg-gradient-to-br from-[#612D91] to-[#A64AC9] rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Need Enterprise Features?</h2>
          <p className="text-base text-white/90 mb-6 max-w-2xl mx-auto">
            Get custom pricing, dedicated support, and enterprise-grade features tailored to your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2.5 bg-white text-[#612D91] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
              Contact Sales
            </button>
            <button className="px-6 py-2.5 bg-white/10 text-white border-2 border-white/30 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

