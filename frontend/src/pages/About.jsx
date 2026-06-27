import { FaUsers, FaGlobe, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../components/UI';

const About = () => {
  const stats = [
    { label: 'Active Users', value: '2M+', icon: FaUsers },
    { label: 'Countries', value: '150+', icon: FaGlobe },
    { label: 'Files Converted', value: '50M+', icon: FaRocket },
    { label: 'Uptime', value: '99.9%', icon: FaShieldAlt },
  ];

  const timeline = [
    { year: '2020', title: 'Founded', description: 'ConvertHub was born with a mission to simplify file conversion' },
    { year: '2021', title: 'Growth', description: 'Reached 100,000 users and expanded to 20+ file formats' },
    { year: '2022', title: 'Innovation', description: 'Launched API platform and batch processing features' },
    { year: '2023', title: 'Global', description: 'Expanded to 150 countries with 24/7 support' },
    { year: '2024', title: 'Enterprise', description: 'Launched Enterprise plans for large organizations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge variant="default" className="mb-4">About Us</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Simplifying File Conversion<br />for Everyone
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            We're building the world's most reliable and user-friendly file conversion platform,
            trusted by millions of users worldwide.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card glass={false} className="text-center">
                  <stat.icon className="text-4xl text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            At ConvertHub, we believe file conversion should be simple, fast, and secure.
            We're dedicated to providing professional-grade tools that anyone can use,
            whether you're a student, freelancer, or enterprise organization.
            Our platform is built with privacy and security at its core, ensuring your
            files are always protected.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-2xl font-bold text-purple-600">{item.year}</span>
                </div>
                <div className="flex-shrink-0 mt-2">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaShieldAlt,
                title: 'Security First',
                description: 'Your files are encrypted and automatically deleted after processing. We never access or store your data.',
              },
              {
                icon: FaRocket,
                title: 'Lightning Fast',
                description: 'Our optimized infrastructure ensures the fastest conversion times without compromising quality.',
              },
              {
                icon: FaUsers,
                title: 'User Focused',
                description: 'We listen to our community and continuously improve based on user feedback and needs.',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card glass={false}>
                  <value.icon className="text-4xl text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
