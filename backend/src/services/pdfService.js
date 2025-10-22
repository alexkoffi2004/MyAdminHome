const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');

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

      // Couleurs et repères
      const blueColor = '#1e40af';
      const blackColor = '#000000';
      const pageWidth = doc.page.width;
      const marginLeft = 40;
      const marginRight = 40;
      const contentWidth = pageWidth - marginLeft - marginRight;

      // En-tête
      const leftHeaderX = marginLeft;
      const leftHeaderWidth = 180;
      const headerTopY = 50;

      doc.fillColor(blackColor).fontSize(12);
      doc.text('DISTRICT D\'ABIDJAN', leftHeaderX, headerTopY, { width: leftHeaderWidth, align: 'center' });
      doc.moveTo(leftHeaderX, headerTopY + 20).lineTo(leftHeaderX + leftHeaderWidth, headerTopY + 20).stroke(blackColor);
      doc.text('COMMUNE D\'ABOBO', leftHeaderX, headerTopY + 30, { width: leftHeaderWidth, align: 'center' });

      // République (à droite)
      doc.text('REPUBLIQUE DE COTE D\'IVOIRE', marginLeft, headerTopY, { width: contentWidth, align: 'right' });

      // Titre centré
      doc.font('Helvetica-Bold').fontSize(16).text('EXTRAIT', marginLeft, 100, { width: contentWidth, align: 'center' });
      doc.font('Helvetica').fontSize(12).text('Du registre des actes de l\'Etat Civil', marginLeft, 120, { width: contentWidth, align: 'center' });
      const currentYear = new Date().getFullYear();
      doc.text(`Pour l'année ${currentYear}`, marginLeft, 140, { width: contentWidth, align: 'center' });

      // Emblème centré
      const centerX = marginLeft + contentWidth / 2;
      const centerY = 180;
      doc.circle(centerX, centerY, 30).stroke(blueColor);
      doc.circle(centerX, centerY, 8).fill(blueColor);

      // Bloc ETAT CIVIL centré
      doc.font('Helvetica-Bold').fontSize(14).fillColor(blackColor).text('ETAT CIVIL', marginLeft, 220, { width: contentWidth, align: 'center' });
      doc.moveTo(marginLeft, 240).lineTo(marginLeft + contentWidth, 240).stroke(blackColor);
      doc.font('Helvetica').fontSize(12).text('Centre Principal', marginLeft, 250, { width: contentWidth, align: 'center' });
      doc.moveTo(marginLeft, 280).lineTo(marginLeft + contentWidth, 280).stroke(blackColor);

      // Corps principal en deux colonnes
      const startY = 300;
      const leftColX = marginLeft;
      const rightColX = marginLeft + Math.floor(contentWidth * 0.55);
      const leftColWidth = Math.floor(contentWidth * 0.45) - 10;
      const rightColWidth = contentWidth - (rightColX - marginLeft);

      // Colonne gauche
      doc.fontSize(11).text(`N°${data.numeroRegistre} DU ${new Date().toLocaleDateString('fr-FR')} DU REGISTRE`, leftColX, startY, { width: leftColWidth });
      doc.font('Helvetica-Bold').fontSize(12).text('NAISSANCE DE', leftColX, startY + 20, { width: leftColWidth });
      doc.fontSize(14).text((data.fullName || '').toUpperCase(), leftColX, startY + 40, { width: leftColWidth });

      // Colonne droite
      const birthDate = new Date(data.birthDate);
      const dateStr = birthDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
      let y = startY;
      doc.font('Helvetica').fontSize(11)
        .text(`Le ${dateStr} ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`à onze heures cinquante huit minutes ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`est né ${data.fullName} ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`${data.birthPlace} ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`fils de ${data.fatherName} (Nat:Ivoirienne) ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`profession Conseiller d'Orientation ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`domicilié Yopougon ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`et de ${data.motherName} ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`profession Sans ./. `, rightColX, y, { width: rightColWidth }); y += 15;
      doc.text(`domiciliée Abobo ./. `, rightColX, y, { width: rightColWidth });

      // Lignes doubles de séparation
      const sepY = startY + 160;
      doc.moveTo(marginLeft, sepY).lineTo(marginLeft + contentWidth, sepY).stroke(blackColor);
      doc.moveTo(marginLeft, sepY + 5).lineTo(marginLeft + contentWidth, sepY + 5).stroke(blackColor);

      // Mentions
      const mentionsY = startY + 180;
      doc.font('Helvetica-Bold').fontSize(12).text('MENTIONS (éventuellement)', marginLeft, mentionsY, { width: contentWidth, align: 'center' });
      doc.font('Helvetica').fontSize(11)
        .text('Marié le ............ Néant ............ à ............ Néant ............ ', marginLeft, mentionsY + 20, { width: contentWidth })
        .text('avec Néant', marginLeft, mentionsY + 35, { width: contentWidth })
        .text('Mariage dissous par décision de divorce en date du ............ Néant', marginLeft, mentionsY + 50, { width: contentWidth })
        .text('Décédé le ............ Néant ............ à ............ Néant', marginLeft, mentionsY + 65, { width: contentWidth });

      // Ligne de séparation
      doc.moveTo(marginLeft, mentionsY + 90).lineTo(marginLeft + contentWidth, mentionsY + 90).stroke(blackColor);

      // Pied de page
      const footerY = mentionsY + 110;
      doc.font('Helvetica').fontSize(11).text('Certifié le présent extrait conforme aux indications portées au registre', marginLeft, footerY, { width: contentWidth });
      const deliveryDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Délivré à ABOBO, le ${deliveryDate}`, marginLeft, footerY, { width: contentWidth, align: 'right' });
      doc.text('L\'Officier de l\'Etat civil,', marginLeft, footerY + 20, { width: contentWidth, align: 'right' });
      doc.moveTo(marginLeft + contentWidth - 160, footerY + 40).lineTo(marginLeft + contentWidth - 60, footerY + 40).stroke(blackColor);
      doc.text('(Signature)', marginLeft + contentWidth - 140, footerY + 45);

      // Sceau (côté gauche)
      const sealX = marginLeft + 60;
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
      
      doc.rect(officerX, officerY, 140, 60)
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
      doc.fontSize(8).text('376314anabi01082022', marginLeft + contentWidth - 120, doc.page.height - 30);

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