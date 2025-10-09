const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Générer un acte de naissance
const generateBirthCertificate = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      const fileName = `birth_certificate_${data._id}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Couleurs
      const blueColor = '#1e40af';
      const blackColor = '#000000';

      // En-tête - District et Commune (côté gauche)
      doc.fontSize(12)
         .fillColor(blackColor)
         .text('DISTRICT D\'ABIDJAN', 50, 50, { align: 'center' });
      
      // Ligne horizontale sous DISTRICT
      doc.moveTo(50, 70)
         .lineTo(200, 70)
         .stroke(blackColor);
      
      doc.text('COMMUNE D\'ABOBO', 50, 80, { align: 'center' });

      // République de Côte d'Ivoire (côté droit)
      doc.text('REPUBLIQUE DE COTE D\'IVOIRE', 400, 50, { align: 'right' });
      
      // EXTRAIT (centré)
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('EXTRAIT', 0, 100, { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Du registre des actes de l\'Etat Civil', 0, 120, { align: 'center' });
      
      const currentYear = new Date().getFullYear();
      doc.text(`Pour l'année ${currentYear}`, 0, 140, { align: 'center' });

      // Emblème/Sceau (centré)
      const centerX = 300;
      const centerY = 180;
      
      // Cercle pour l'emblème
      doc.circle(centerX, centerY, 30)
         .stroke(blueColor);
      
      // Étoile au centre (simplifiée en cercle)
      doc.circle(centerX, centerY, 8)
         .fill(blueColor);
      
      // ETAT CIVIL
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('ETAT CIVIL', 0, 220, { align: 'center' });
      
      // Ligne horizontale
      doc.moveTo(50, 240)
         .lineTo(550, 240)
         .stroke(blackColor);
      
      doc.text('Centre Principal', 0, 250, { align: 'center' });

      // Ligne de séparation
      doc.moveTo(50, 280)
         .lineTo(550, 280)
         .stroke(blackColor);

      // Corps principal
      const startY = 300;
      
      // Numéro du registre (côté gauche)
      doc.fontSize(11)
         .text(`N°${data.numeroRegistre || 'N°01'} DU ${new Date().toLocaleDateString('fr-FR')} DU REGISTRE`, 50, startY);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('NAISSANCE DE', 50, startY + 20);
      
      doc.fontSize(14)
         .text(data.fullName.toUpperCase(), 50, startY + 40);
      
      doc.fontSize(12)
         .text('KOFFI./', 50, startY + 60);

      // Détails de naissance (côté droit)
      const birthDate = new Date(data.birthDate);
      const dateStr = birthDate.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.fontSize(11)
         .text(`Le ${dateStr} ./. `, 300, startY);
      doc.text(`à onze heures cinquante huit minutes ./. `, 300, startY + 15);
      doc.text(`est né ${data.fullName} ./. `, 300, startY + 30);
      doc.text(`${data.birthPlace} ./. `, 300, startY + 45);
      doc.text(`fils de ${data.fatherName} (Nat:Ivoirienne) KOFFI./. `, 300, startY + 60);
      doc.text(`profession Conseiller d'Orientation ./. `, 300, startY + 75);
      doc.text(`domicilié Yopougon./. `, 300, startY + 90);
      doc.text(`et de ${data.motherName} ./. `, 300, startY + 105);
      doc.text(`profession Sans ./. `, 300, startY + 120);
      doc.text(`domiciliée Abobo./. `, 300, startY + 135);

      // Lignes doubles de séparation
      doc.moveTo(50, startY + 160)
         .lineTo(550, startY + 160)
         .stroke(blackColor);
      doc.moveTo(50, startY + 165)
         .lineTo(550, startY + 165)
         .stroke(blackColor);

      // Mentions
      const mentionsY = startY + 180;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('MENTIONS (éventuellement)', 0, mentionsY, { align: 'center' });
      
      doc.fontSize(11)
         .text('Marié le ............ Néant ............ à ............ Néant ............ ', 50, mentionsY + 20);
      doc.text('avec Néant', 50, mentionsY + 35);
      doc.text('Mariage dissous par décision de divorce en date du ............ Néant', 50, mentionsY + 50);
      doc.text('Décédé le ............ Néant ............ à ............ Néant', 50, mentionsY + 65);

      // Ligne de séparation
      doc.moveTo(50, mentionsY + 90)
         .lineTo(550, mentionsY + 90)
         .stroke(blackColor);

      // Pied de page
      const footerY = mentionsY + 110;
      doc.text('Certifié le présent extrait conforme aux indications portées au registre', 50, footerY);
      
      // Date de délivrance (côté droit)
      const deliveryDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Délivré à ABOBO, le ${deliveryDate}`, 400, footerY);
      doc.text('L\'Officier de l\'Etat civil,', 400, footerY + 20);
      
      // Ligne pour signature
      doc.moveTo(400, footerY + 40)
         .lineTo(500, footerY + 40)
         .stroke(blackColor);
      doc.text('(Signature)', 420, footerY + 45);

      // Sceau (côté gauche)
      const sealX = 100;
      const sealY = footerY + 20;
      
      // Grand sceau circulaire
      doc.circle(sealX, sealY, 40)
         .stroke(blueColor);
      
      // Texte dans le sceau
      doc.fontSize(8)
         .text('REPUBLIQUE', sealX - 25, sealY - 15, { align: 'center' });
      doc.text('DE COTE D\'IVOIRE', sealX - 25, sealY - 5, { align: 'center' });
      doc.text('DISTRICT D\'ABIDJAN', sealX - 25, sealY + 5, { align: 'center' });
      doc.text('COMMUNE D\'ABOBO', sealX - 25, sealY + 15, { align: 'center' });
      doc.text('TAXE MUNICIPALE', sealX - 25, sealY + 25, { align: 'center' });
      doc.text('500', sealX - 25, sealY + 35, { align: 'center' });
      doc.text('N°A57327484', sealX - 25, sealY + 45, { align: 'center' });

      // Code-barres (simulé par des lignes)
      for (let i = 0; i < 20; i++) {
        doc.moveTo(sealX - 10, sealY + 60 + i * 2)
           .lineTo(sealX - 5, sealY + 60 + i * 2)
           .stroke(blackColor);
      }

      // Cadre avec nom de l'officier (côté droit)
      const officerX = 400;
      const officerY = footerY + 60;
      
      doc.rect(officerX, officerY, 120, 60)
         .stroke(blueColor);
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('OUATTARA SOULEYMANE', officerX + 5, officerY + 5);
      doc.fontSize(8)
         .font('Helvetica')
         .text('Conseiller Municipal', officerX + 5, officerY + 20);
      doc.text('Officier d\'Etat - Civil Délégué', officerX + 5, officerY + 35);
      doc.text('COMMUNE D\'ABOBO', officerX + 5, officerY + 50);

      // Code alphanumérique en bas
      doc.fontSize(8)
         .text('376314anabi01082022', 500, doc.page.height - 30);

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath
        });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Générer un certificat de décès
const generateDeathCertificate = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const fileName = `death_certificate_${data._id}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(20).text('CERTIFICAT DE DECES', { align: 'center' });
      doc.moveDown();

      // Informations
      doc.fontSize(12);
      doc.text(`Nom et prénoms du défunt: ${data.fullName}`);
      doc.text(`Date de décès: ${new Date(data.deathInfo.deathDate).toLocaleDateString()}`);
      doc.text(`Lieu de décès: ${data.deathInfo.deathPlace}`);
      doc.text(`Cause du décès: ${data.deathInfo.deathCause}`);
      doc.moveDown();

      // Signature
      doc.text('Signature et cachet de l\'officier d\'état civil', { align: 'right' });
      doc.moveDown();
      doc.text(`Date de délivrance: ${new Date().toLocaleDateString()}`);

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath
        });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Générer un reçu de paiement
const generateReceipt = async (payment, request, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `receipt-${payment._id}.pdf`;
      const filePath = path.join(__dirname, '../../uploads', fileName);

      // Créer le stream d'écriture
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // En-tête
      doc.fontSize(20).text('Reçu de Paiement', { align: 'center' });
      doc.moveDown();

      // Informations de la demande
      doc.fontSize(12).text('Détails de la demande:');
      doc.fontSize(10)
        .text(`Type de document: ${request.documentType}`)
        .text(`Commune: ${request.commune}`)
        .text(`Nom: ${request.fullName}`)
        .text(`Date de la demande: ${request.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // Informations de paiement
      doc.fontSize(12).text('Détails du paiement:');
      doc.fontSize(10)
        .text(`Montant: ${payment.amount} ${payment.currency}`)
        .text(`Méthode de paiement: ${payment.paymentMethod}`)
        .text(`Statut: ${payment.status}`)
        .text(`Date du paiement: ${payment.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // Informations du client
      doc.fontSize(12).text('Informations client:');
      doc.fontSize(10)
        .text(`Nom: ${user.firstName} ${user.lastName}`)
        .text(`Email: ${user.email}`)
        .text(`Téléphone: ${user.phoneNumber || 'Non renseigné'}`);
      doc.moveDown();

      // Pied de page
      doc.fontSize(8)
        .text('Ce document est un reçu officiel de paiement.', { align: 'center' })
        .text('Merci de votre confiance.', { align: 'center' });

      // Finaliser le PDF
      doc.end();

      // Attendre que le fichier soit créé
      stream.on('finish', async () => {
        try {
          // Upload vers Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'receipts',
            resource_type: 'raw'
          });

          // Supprimer le fichier local
          fs.unlinkSync(filePath);

          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReceipt,
  generateBirthCertificate,
  generateDeathCertificate
}; 