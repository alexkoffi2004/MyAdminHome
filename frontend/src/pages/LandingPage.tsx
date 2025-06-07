import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, FileText, Lock, Clock, CreditCard, HelpCircle } from 'lucide-react';
import Button from '../components/UI/Button';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Function to redirect to the appropriate dashboard based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'citizen':
        return '/citizen/dashboard';
      case 'agent':
        return '/agent/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-900">
      {/* Navigation */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container-custom flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <FileText size={18} />
            </div>
            <span className="font-heading text-xl font-bold text-primary-500">E-Civil</span>
          </div>
          
          <nav className="hidden space-x-8 md:flex">
            <a href="#services" className="text-neutral-700 hover:text-primary-500 dark:text-neutral-300 dark:hover:text-primary-400">Services</a>
            <a href="#how-it-works" className="text-neutral-700 hover:text-primary-500 dark:text-neutral-300 dark:hover:text-primary-400">Comment ça marche</a>
            <a href="#faq" className="text-neutral-700 hover:text-primary-500 dark:text-neutral-300 dark:hover:text-primary-400">FAQ</a>
            <a href="#contact" className="text-neutral-700 hover:text-primary-500 dark:text-neutral-300 dark:hover:text-primary-400">Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button>Mon Espace</Button>
              </Link>
            ) : (
              <>
                <div className="relative group">
                  <button className="text-neutral-700 hover:text-primary-500 dark:text-neutral-300 dark:hover:text-primary-400">
                    Connexion
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:bg-neutral-800">
                    <Link to="/citizen/login" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                      Espace Citoyen
                    </Link>
                    <Link to="/agent/login" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                      Espace Agent
                    </Link>
                    <Link to="/admin/login" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                      Espace Admin
                    </Link>
                  </div>
                </div>
                <Link to="/register">
                  <Button>Inscription</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-16 dark:from-primary-900/20 dark:to-neutral-900">
        <div className="container-custom pb-20 pt-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold leading-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
                Simplifiez vos <span className="text-primary-500">démarches administratives</span> d'état civil
              </h1>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                Obtenez vos actes d'état civil en ligne sans vous déplacer. Simple, rapide et sécurisé.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg">Créer un compte</Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">Comment ça marche</Button>
                </a>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <Check size={16} className="mr-2 text-success-500" />
                  100% Sécurisé
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <Check size={16} className="mr-2 text-success-500" />
                  Documents Officiels
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <Check size={16} className="mr-2 text-success-500" />
                  Service Rapide
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="https://images.pexels.com/photos/8867433/pexels-photo-8867433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="E-civil services illustration" 
                className="h-auto max-w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-white">Nos Services</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Découvrez tous les documents administratifs que vous pouvez demander en ligne
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FileText size={24} />,
                title: "Acte de Naissance",
                description: "Obtenez une copie intégrale ou un extrait de votre acte de naissance."
              },
              {
                icon: <FileText size={24} />,
                title: "Acte de Mariage",
                description: "Demandez un acte ou une copie de votre certificat de mariage."
              },
              {
                icon: <FileText size={24} />,
                title: "Acte de Décès",
                description: "Récupérez un acte de décès pour vos démarches administratives."
              },
              {
                icon: <FileText size={24} />,
                title: "Certificat de Nationalité",
                description: "Faites une demande de certificat de nationalité ivoirienne."
              },
              {
                icon: <FileText size={24} />,
                title: "Certificat de Résidence",
                description: "Obtenez une attestation de résidence en quelques clics."
              },
              {
                icon: <FileText size={24} />,
                title: "Casier Judiciaire",
                description: "Demandez votre extrait de casier judiciaire en ligne."
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="group rounded-lg border border-neutral-200 bg-white p-6 shadow-soft transition-all hover:border-primary-200 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-primary-900/50"
              >
                <div className="mb-4 rounded-full bg-primary-100 p-3 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/30 dark:text-primary-400">
                  {service.icon}
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-neutral-900 dark:text-white">{service.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{service.description}</p>
                <div className="mt-4">
                  <Link to="/register">
                    <Button variant="outline" fullWidth>Faire une demande</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-neutral-50 py-16 dark:bg-neutral-800">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-white">Comment ça marche</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Obtenir vos documents administratifs n'a jamais été aussi simple
            </p>
          </div>
          
          <div className="relative mt-16">
            {/* Progress line */}
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-700 md:left-0 md:top-1/2 md:h-1 md:w-full md:-translate-y-1/2 md:translate-x-0"></div>
            
            <div className="relative grid gap-8 md:grid-cols-4">
              {[
                {
                  icon: <FileText size={24} />,
                  title: "1. Créez un compte",
                  description: "Inscrivez-vous en quelques minutes sur notre plateforme sécurisée."
                },
                {
                  icon: <FileText size={24} />,
                  title: "2. Remplissez le formulaire",
                  description: "Sélectionnez le document souhaité et complétez les informations requises."
                },
                {
                  icon: <CreditCard size={24} />,
                  title: "3. Effectuez le paiement",
                  description: "Payez en toute sécurité via mobile money ou carte bancaire."
                },
                {
                  icon: <FileText size={24} />,
                  title: "4. Recevez votre document",
                  description: "Téléchargez votre document ou recevez-le par livraison."
                },
              ].map((step, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-center font-heading text-lg font-semibold text-neutral-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-center text-neutral-600 dark:text-neutral-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-white">Questions Fréquentes</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Trouvez les réponses à vos questions sur notre service
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                question: "Combien de temps faut-il pour recevoir mon document ?",
                answer: "Le délai de traitement varie selon le type de document et la commune concernée. En général, les demandes sont traitées sous 2 à 5 jours ouvrables."
              },
              {
                question: "Les documents délivrés sont-ils officiels ?",
                answer: "Oui, tous les documents délivrés par notre plateforme sont officiels et légalement valides, car ils sont émis par les autorités compétentes."
              },
              {
                question: "Comment puis-je payer pour mes documents ?",
                answer: "Nous acceptons les paiements par mobile money (Orange Money, MTN Mobile Money, Moov Money) et par carte bancaire."
              },
              {
                question: "Puis-je suivre l'état de ma demande ?",
                answer: "Oui, après avoir soumis votre demande, vous pouvez suivre son statut en temps réel depuis votre compte."
              },
              {
                question: "Que faire si ma demande est rejetée ?",
                answer: "Si votre demande est rejetée, vous recevrez une notification avec la raison du rejet. Vous pourrez corriger les informations et soumettre à nouveau."
              },
              {
                question: "Comment récupérer mon document ?",
                answer: "Vous pouvez télécharger votre document directement depuis la plateforme ou choisir une livraison à domicile moyennant des frais supplémentaires."
              },
            ].map((faq, index) => (
              <div key={index} className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
                <h3 className="font-heading text-lg font-semibold text-neutral-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="mb-4 text-neutral-600 dark:text-neutral-300">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <a href="#contact">
              <Button variant="outline">Contactez-nous</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-neutral-50 py-16 dark:bg-neutral-800">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-white">Contactez-nous</h2>
                <p className="mt-4 text-neutral-600 dark:text-neutral-300">
                  Notre équipe est à votre disposition pour répondre à toutes vos questions sur nos services.
                </p>
                
                <div className="mt-8 space-y-6">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">Email</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">contact@e-civil.ci</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">Téléphone</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">+225 27 20 XX XX XX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">Adresse</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">Abidjan, Plateau - Immeuble CCIA</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-card dark:bg-neutral-700">
                <form>
                  <div className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1 block text-sm text-neutral-700 dark:text-white">Nom</label>
                        <input
                          type="text"
                          id="name"
                          className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-neutral-700 dark:text-white">Email</label>
                        <input
                          type="email"
                          id="email"
                          className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="mb-1 block text-sm text-neutral-700 dark:text-white">Sujet</label>
                      <input
                        type="text"
                        id="subject"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="mb-1 block text-sm text-neutral-700 dark:text-white">Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      ></textarea>
                    </div>
                    <div>
                      <Button fullWidth type="submit">
                        Envoyer le message
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 py-12 text-white">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
            <div className="md:col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
                  <FileText size={18} />
                </div>
                <span className="font-heading text-xl font-bold text-white">E-Civil</span>
              </div>
              <p className="mt-4 max-w-md text-neutral-400">
                La plateforme officielle de gestion des documents administratifs d'état civil en Côte d'Ivoire.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4 font-heading text-lg font-semibold text-white">Services</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary-400">Acte de Naissance</a></li>
                <li><a href="#" className="hover:text-primary-400">Acte de Mariage</a></li>
                <li><a href="#" className="hover:text-primary-400">Acte de Décès</a></li>
                <li><a href="#" className="hover:text-primary-400">Certificat de Nationalité</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-heading text-lg font-semibold text-white">Liens Rapides</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary-400">À propos</a></li>
                <li><a href="#faq" className="hover:text-primary-400">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-400">Tarifs</a></li>
                <li><a href="#contact" className="hover:text-primary-400">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-heading text-lg font-semibold text-white">Légal</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary-400">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary-400">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary-400">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-neutral-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-neutral-400">
                &copy; {new Date().getFullYear()} E-Civil. Tous droits réservés.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.457 0 1.819.957 3.422 2.41 4.36-.888-.027-1.723-.271-2.456-.677v.072c0 2.54 1.794 4.663 4.18 5.145-.454.115-.932.176-1.424.176-.34 0-.673-.033-.996-.092.672 2.082 2.613 3.6 4.918 3.643-1.797 1.409-4.067 2.248-6.52 2.248-.424 0-.842-.025-1.252-.075 2.327 1.496 5.084 2.366 8.049 2.366 9.658 0 14.936-7.999 14.936-14.936 0-.226-.005-.452-.015-.677.964-.694 1.8-1.562 2.46-2.548l.047-.071z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109.608 0 1.1.497 1.1 1.109 0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;