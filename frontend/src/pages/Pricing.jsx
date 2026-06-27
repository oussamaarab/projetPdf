import { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../components/UI';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for trying out ConvertHub',
      features: [
        { text: '10 conversions per month', included: true },
        { text: 'Basic file formats', included: true },
        { text: 'Max 10MB file size', included: true },
        { text: 'Standard conversion speed', included: true },
        { text: 'Email support', included: true },
        { text: 'API access', included: false },
        { text: 'Priority processing', included: false },
        { text: 'Batch processing', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 19, annual: 190 },
      description: 'For professionals and power users',
      features: [
        { text: 'Unlimited conversions', included: true },
        { text: 'All file formats', included: true },
        { text: 'Max 100MB file size', included: true },
        { text: 'Priority conversion speed', included: true },
        { text: 'Priority email support', included: true },
        { text: 'API access (10k requests/mo)', included: true },
        { text: 'Batch processing', included: true },
        { text: 'No watermarks', included: true },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      description: 'For teams and organizations',
      features: [
        { text: 'Unlimited conversions', included: true },
        { text: 'All file formats + custom', included: true },
        { text: 'Unlimited file size', included: true },
        { text: 'Fastest conversion speed', included: true },
        { text: '24/7 phone & email support', included: true },
        { text: 'Unlimited API access', included: true },
        { text: 'Advanced batch processing', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantee', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">Pricing Plans</Badge>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Choose the Perfect Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include core features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            <Badge variant="success" size="sm">Save 17%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="primary">Most Popular</Badge>
                </div>
              )}
              
              <Card
                hover={false}
                glass={false}
                className={`h-full ${plan.popular ? 'ring-2 ring-purple-600 shadow-xl' : ''}`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-slate-600">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price.annual > 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                      ${(plan.price.annual / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>

                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full mb-6"
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-slate-400 mt-1 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 mb-8">
            Have questions? Check our{' '}
            <a href="/contact" className="text-purple-600 hover:underline">support page</a>
            {' '}or contact our team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
