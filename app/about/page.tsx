"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, ChevronDown, FileText, ArrowUpRight } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

// Portfolio data
const projects = [
  {
    id: 1,
    title: "Opinion.arb",
    description:
      "Real-time prediction market arbitrage dashboard. Discover edge opportunities across Opinion.trade, Kalshi, and Polymarket with live price monitoring.",
    liveUrl: "https://arb-opionions.vercel.app/",
  },
  {
    id: 2,
    title: "Saba Wallet",
    description:
      "A neobank app designed for the Ethiopian diaspora. Sleek payment interface with smooth animations and intuitive UX for cross-border transactions.",
    liveUrl: "https://cashapp-style-app.vercel.app/",
  },
];

const articles = [
  {
    id: 1,
    title: "The Punk and the Cat: Two Flywheels, One Strategy",
    excerpt:
      "Exploring the fascinating dynamics between different crypto communities and their strategic approaches to building lasting value.",
    date: "Oct 5, 2025",
    url: "https://aaronteklu.substack.com/p/the-punk-and-the-cat-two-flywheels",
    featured: true,
  },
  {
    id: 2,
    title: "Stablecoins and the New Dollar Empire",
    excerpt:
      "How stablecoins are reshaping global finance and extending dollar dominance into the digital age.",
    date: "Sep 12, 2025",
    url: "https://aaronteklu.substack.com/p/stablecoins-and-the-new-dollar-empire",
  },
  {
    id: 3,
    title: "The Hidden Edge",
    excerpt:
      "Finding advantages in markets where others overlook opportunities.",
    date: "Sep 6, 2025",
    url: "https://aaronteklu.substack.com/p/the-hidden-edge",
  },
];

const bio = {
  paragraphs: [
    "I'm Aaron Teklu, a USC student exploring the intersection of crypto, new media, and markets. I've worked across consulting, wealth management, and DeFi, and I'm currently focused on prediction market infrastructure and stablecoin-powered neobanks. When I'm not working, I'm probably making mixes on my DDJ or playing basketball with friends.",
  ],
  interests: [
    "Prediction Markets",
    "DeFi",
    "Market Microstructure",
    "DJing",
    "Basketball",
  ],
  socials: [
    { name: "GitHub", url: "https://github.com/aarontekluuu", icon: SiGithub },
    { name: "X", url: "https://x.com/aaron_teklu", icon: SiX },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/aaronteklu",
      icon: SiLinkedin,
    },
  ],
};

// Hero Component
function Hero() {
  const name = "Aaron Teklu";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg via-terminal-bg/80 to-terminal-bg/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg via-transparent to-terminal-bg" />
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-terminal-text"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {name.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={char === " " ? "inline-block w-4" : "inline-block"}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          className="mt-12 flex gap-4 justify-center flex-wrap"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.a
            href="#projects"
            className="font-mono text-sm text-terminal-dim hover:text-terminal-text transition-colors underline underline-offset-4"
            whileHover={{ y: -2 }}
          >
            VIEW PROJECTS
          </motion.a>
          <motion.a
            href="#writing"
            className="font-mono text-sm text-terminal-dim hover:text-terminal-text transition-colors underline underline-offset-4"
            whileHover={{ y: -2 }}
          >
            READ WRITING
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6 text-terminal-dim" />
      </motion.div>
    </section>
  );
}

// Project Card Component
function ProjectCard({
  title,
  description,
  liveUrl,
}: {
  title: string;
  description: string;
  liveUrl?: string;
}) {
  return (
    <motion.div
      className="group relative bg-terminal-surface border border-terminal-border rounded-lg overflow-visible p-6 hover:border-terminal-accent transition-all duration-200"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        <h3 className="text-xl font-semibold group-hover:underline underline-offset-4 transition-all text-terminal-text">
          {title}
        </h3>

        <p className="text-terminal-dim text-sm leading-relaxed">
          {description}
        </p>

        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-terminal-dim hover:text-terminal-accent transition-colors mt-2"
          >
            VIEW LIVE
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// Projects Section
function Projects() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-terminal-text">
            Projects
          </h2>
          <p className="text-terminal-dim mb-12 max-w-xl">
            Things I've built recently. Each project represents an exploration
            of new ideas and technologies.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <ProjectCard
                title={project.title}
                description={project.description}
                liveUrl={project.liveUrl}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Article Card Component
function ArticleCard({
  title,
  excerpt,
  date,
  url,
  featured = false,
}: {
  title: string;
  excerpt?: string;
  date: string;
  url: string;
  featured?: boolean;
}) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-terminal-surface border border-terminal-border rounded-lg overflow-visible hover:border-terminal-accent transition-all ${
        featured ? "p-8" : "p-6"
      }`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <p className="text-xs font-mono text-terminal-dim uppercase tracking-wider">
            {date}
          </p>
          <h3
            className={`font-semibold group-hover:underline underline-offset-4 transition-all text-terminal-text ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {title}
          </h3>
          {excerpt && (
            <p className="text-terminal-dim text-sm leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>
        <ArrowUpRight className="w-5 h-5 text-terminal-dim group-hover:text-terminal-accent transition-colors flex-shrink-0" />
      </div>
    </motion.a>
  );
}

// Writing Section
function Writing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const featuredArticle = articles.find((a) => a.featured);
  const recentArticles = articles.filter((a) => !a.featured);

  return (
    <section id="writing" className="py-24 px-6 bg-terminal-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-terminal-text">
            Writing
          </h2>
          <p className="text-terminal-dim mb-12 max-w-xl">
            Thoughts on crypto, markets, and technology. Published on Substack.
          </p>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {featuredArticle && (
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <ArticleCard
                title={featuredArticle.title}
                excerpt={featuredArticle.excerpt}
                date={featuredArticle.date}
                url={featuredArticle.url}
                featured
              />
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <ArticleCard
                  title={article.title}
                  excerpt={article.excerpt}
                  date={article.date}
                  url={article.url}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a
            href="https://substack.com/@aaronteklu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-terminal-border rounded-lg text-terminal-text hover:border-terminal-accent hover:text-terminal-accent transition-all font-mono text-sm"
          >
            View All Articles
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// About Section
function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-terminal-text">
            About
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="lg:col-span-3 space-y-6"
            variants={itemVariants}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {bio.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-terminal-text leading-relaxed text-lg"
              >
                {paragraph}
              </p>
            ))}

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/Teklu_Aaron_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-terminal-border rounded-lg text-terminal-text hover:border-terminal-accent hover:text-terminal-accent transition-all font-mono text-sm"
              >
                <FileText className="w-4 h-4" />
                Resume
              </a>

              <div className="flex gap-2">
                {bio.socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="p-2 border border-terminal-border rounded-lg text-terminal-dim hover:text-terminal-accent hover:border-terminal-accent transition-all"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            variants={itemVariants}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-4">
                Interests
              </h3>
              <ul className="space-y-3">
                {bio.interests.map((interest, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-terminal-text"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent" />
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-terminal-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-terminal-dim font-mono">
            {new Date().getFullYear()} Aaron Teklu
          </p>

          <div className="flex items-center gap-4">
            {bio.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-dim hover:text-terminal-accent transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <p className="text-xs text-terminal-dim font-mono">
            Built with Next.js + Tailwind
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

// Main Portfolio Page
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text scroll-smooth">
      {/* Back to Home Link */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-terminal-dim hover:text-terminal-accent transition-colors text-sm font-mono"
        >
          <span className="text-terminal-accent">&lt;</span>
          Back to Terminal
        </Link>
      </div>

      <main>
        <Hero />
        <Projects />
        <Writing />
        <About />
      </main>
      <Footer />
    </div>
  );
}
