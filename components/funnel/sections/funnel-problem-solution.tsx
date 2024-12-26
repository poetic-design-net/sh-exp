"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Problem {
  title: string;
  description: string;
}

interface Solution {
  title: string;
  description: string;
}

interface FunnelProblemSolutionProps {
  problems: Problem[];
  solution: Solution;
}

export function FunnelProblemSolution({ problems, solution }: FunnelProblemSolutionProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Kennen Sie diese Probleme?</h2>
          <p className="text-xl text-gray-600">Wir haben die Lösung für Sie</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {problems.map((problem, index) => (
              <motion.div 
                key={index}
                className="flex items-start space-x-4"
                {...fadeIn}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-8">
            <motion.div 
              className="flex items-start space-x-4"
              {...fadeIn}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                <p className="text-gray-600">{solution.description}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
