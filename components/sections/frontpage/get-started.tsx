import React from 'react';
import Image from 'next/image';

const GetStarted = () => {
  return (
    <section className="relative py-12 md:py-20">
      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/static/clouds-bg.webp"
          alt="Background"
          fill
          className="object-cover opacity-0"
          priority
        />
      </div>
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0  from-white/95 to-coolGray-100/90 dark:from-slate-900/80 dark:to-slate-800/80" />

      <div className="container mx-auto px-4 relative">
        <div className="pb-12 pt-20 lg:pt-12 px-8 sm:px-12 xl:px-32 bg-coolGray-50 dark:bg-slate-900/50 rounded-3xl">
          <div className="flex flex-wrap -mx-4 items-center">
            <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
              <div className="max-w-lg mx-auto space-y-8">
                <div className="relative">
                  <svg
                    className="absolute -top-6 -left-20 w-12 h-12 text-cyan-500 dark:text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <h3 className="text-slate-900 dark:text-white font-semibold text-4xl lg:text-5xl tracking-tight mb-6">
                    Ich wollte Weltmeister werden und habe gelernt, wie man die Welt meistert.
                  </h3>
                </div>
                <p className="w-full text-cyan-950 text-base xl:text-xl leading-tight xl:leading-relaxed dark:text-coolGray-50">
                  Auch mit seinem dritten Buch WELTMEISTERER zieht Stefan Hiene, Meister der Deprogrammierung, alle Register und führt seine Leser jenseits der gewohnten Mainstream-Pfade zurück zu ihrem Ursprung: Ihre Welt in sich.
                </p>
                <a 
                  className="group inline-flex py-5 px-8 items-center justify-center leading-none font-medium text-slate-900 dark:text-white hover:text-white dark:hover:text-slate-900 border border-slate-900 dark:border-white rounded-full hover:bg-slate-900 dark:hover:bg-white transition duration-200" 
                  href="#"
                >
                  <span className="mr-2">Jetzt bestellen</span>
                  <span className="group-hover:rotate-45 transform transition duration-100">
                    <svg 
                      width="10" 
                      height="10" 
                      viewBox="0 0 10 10" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M9 1L1 9" 
                        stroke="currentColor" 
                        strokeWidth="1.3" 
                        strokeMiterlimit="10" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M9 8.33571V1H1.66429" 
                        stroke="currentColor" 
                        strokeWidth="1.3" 
                        strokeMiterlimit="10" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-4">
              <Image
                className="block"
                src="/weltmeisterer-book.webp"
                alt="Weltmeisterer Buch von Stefan Hiene"
                width={400}
                height={400}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
