const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un extrait de naissance conforme au modèle ivoirien
 * @param {Object} requestData - Données de la demande depuis la base de données
 * @param {Object} agent - Informations de l'agent qui génère le document
 * @returns {Promise<Object>} - Chemin du fichier et URL
 */
const generateBirthExtract = async (requestData, agent) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer le dossier extraits s'il n'existe pas
      const extraitsDir = path.join(__dirname, '../../extraits');
      if (!fs.existsSync(extraitsDir)) {
        fs.mkdirSync(extraitsDir, { recursive: true });
      }

      // Nom du fichier
      const fileName = `extrait_naissance_${requestData._id}_${Date.now()}.pdf`;
      const filePath = path.join(extraitsDir, fileName);

      // Créer le document PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe vers le fichier
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Extraire les données directement du request (pas de details)
      const commune = requestData.commune?.name || requestData.commune || 'ABOBO';
      const district = 'ABIDJAN';
      const annee = new Date(requestData.childBirthDate || requestData.createdAt).getFullYear();
      
      // Formater la date de naissance
      const birthDate = new Date(requestData.childBirthDate || requestData.createdAt);
      const dateFormatted = birthDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      // Déterminer le genre
      const gender = requestData.childGender === 'F' ? 'fille' : 'fils';
      const genderArticle = requestData.childGender === 'F' ? 'née' : 'né';

      // ==================== EN-TÊTE ====================
      const pageWidth = doc.page.width;
      const leftMargin = 50;
      const rightMargin = pageWidth - 50;

      // Colonne gauche
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`DISTRICT D'${district}`, leftMargin, 60, { width: 200 });
      
      doc.fontSize(9)
         .font('Helvetica')
         .text(`COMMUNE D'${commune}`, leftMargin, 80, { width: 200 });

      // Logo des armoiries (aligné à gauche avec COMMUNE D'ABOBO)
      const logoPath = path.join(__dirname, '../../assets/images.jpeg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, leftMargin, 100, { 
          width: 80,
          height: 80
        });
      }

      // ETAT CIVIL sous le logo (aligné à gauche)
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('ETAT CIVIL', leftMargin, 185, { width: 200, align: 'left' });
      
      doc.fontSize(7)
         .font('Helvetica')
         .text('Centre Principal', leftMargin, 198, { width: 200, align: 'left' });

      // Colonne droite
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('REPUBLIQUE DE COTE D\'IVOIRE', rightMargin - 200, 60, { width: 200, align: 'center' });
      
      doc.fontSize(7)
         .text('----------', rightMargin - 200, 75, { width: 200, align: 'center' });

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('EXTRAIT', rightMargin - 200, 90, { width: 200, align: 'center' });

      doc.fontSize(9)
         .font('Helvetica')
         .text('Du registre des actes de l\'État Civil', rightMargin - 200, 110, { width: 200, align: 'center' });

      doc.fontSize(8)
         .text(`Pour l'année ${annee}`, rightMargin - 200, 125, { width: 200, align: 'center' });

      // ==================== MISE EN PAGE EN DEUX COLONNES ====================
      const leftColumnX = leftMargin;
      const rightColumnX = leftMargin + 250; // Colonne droite commence à 250px de la gauche
      const columnWidth = pageWidth - 350; // Largeur de la colonne droite
      
      let leftY = 220;  // Position Y pour la colonne gauche (descendu pour éviter le logo)
      let rightY = 220; // Position Y pour la colonne droite (même hauteur)
      
      // ==================== COLONNE GAUCHE: N° + NAISSANCE DE ====================
      // Bloc gauche: N° du registre
      doc.fontSize(9)
         .font('Helvetica')
         .text(`N°${requestData.numeroRegistre || requestData.reference || '____'} DU ${new Date(requestData.createdAt).toLocaleDateString('fr-FR')} DU REGISTRE`, leftColumnX, leftY);

      leftY += 20;
      
      // Bloc gauche: NAISSANCE DE
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('NAISSANCE DE', leftColumnX, leftY);

      leftY += 15;
      
      // Bloc gauche: Nom de l'enfant
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(`${requestData.childLastName || ''} ${requestData.childFirstName || ''} ./.`, leftColumnX, leftY);

      // ==================== COLONNE DROITE: CORPS DU TEXTE ====================
      const lineSpacing = 22; // Espacement de 1.5 entre les lignes
      
      // Ligne 1: Date et heure
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Le ${dateFormatted} ./. à ${requestData.childBirthTime || 'onze heures cinquante huit minutes'} ./.`, rightColumnX, rightY, {
           width: columnWidth,
           align: 'left'
         });
      
      rightY += lineSpacing;
      
      // Ligne 2: Est né(e) + nom
      doc.text(`est ${genderArticle} ${requestData.childLastName || ''} ${requestData.childFirstName || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 3: Maternité
      doc.text(`${requestData.childMaternity || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 4: Fils/Fille de (père)
      doc.text(`${gender} de ${requestData.fatherFullName || ''} (Nat:${requestData.fatherNationality || 'Ivoirienne'}) KOFFI ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 5: Profession père
      doc.text(`profession ${requestData.fatherProfession || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 6: Domicile père
      doc.text(`domicilié ${requestData.fatherAddress || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 7: Et de (mère)
      doc.text(`et de ${requestData.motherFullName || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 8: Profession mère
      doc.text(`profession ${requestData.motherProfession || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      rightY += lineSpacing;
      
      // Ligne 9: Domicile mère
      doc.text(`domiciliée ${requestData.motherAddress || ''} ./.`, rightColumnX, rightY, {
        width: columnWidth,
        align: 'left'
      });
      
      // Utiliser la position la plus basse entre leftY et rightY pour continuer
      let currentY = Math.max(leftY, rightY) + 25; // Espace avant MENTIONS

      // ==================== MENTIONS ====================
      // Ligne de séparation
      doc.moveTo(leftMargin, currentY)
         .lineTo(rightMargin, currentY)
         .stroke();

      currentY += 10;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('M E N T I O N S', leftMargin, currentY, { width: pageWidth - 100, align: 'center' });
      
      currentY += 15;
      
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text('(éventuellement)', leftMargin, currentY, { width: pageWidth - 100, align: 'center' });

      currentY += 15;
      
      doc.fontSize(9)
         .font('Helvetica')
         .text('Marié le ... Néant ........................ à ... Néant ........................................', leftMargin, currentY, {
           width: pageWidth - 100,
           align: 'left'
         });
      
      currentY += 15;
      
      doc.text('avec ... Néant ........................................................................', leftMargin, currentY, {
        width: pageWidth - 100,
        align: 'left'
      });

      currentY += 15;
      
      doc.text('Mariage dissous par décision de divorce en date du ... Néant ............................', leftMargin, currentY, {
        width: pageWidth - 100,
        align: 'left'
      });
      
      currentY += 15;
      
      doc.text('.............................................................................', leftMargin, currentY, {
        width: pageWidth - 100,
        align: 'left'
      });

      currentY += 15;
      
      doc.text('Décédé le ... Néant ....................... à ... Néant ............................', leftMargin, currentY, {
        width: pageWidth - 100,
        align: 'left'
      });

      currentY += 15;
      
      doc.fontSize(9)
         .font('Helvetica')
         .text('Certifié le présent extrait conforme aux indications portées au registre', leftMargin, currentY);

      // ==================== PIED DE PAGE ====================
      currentY += 30; // Espace avant le pied de page

      // Date et lieu de délivrance
      doc.fontSize(9)
         .font('Helvetica')
         .text(`Délivré à ${commune}, le ${new Date().toLocaleDateString('fr-FR')}`, rightMargin - 200, currentY, { 
           width: 200, 
           align: 'left' 
         });

      currentY += 15;
      
      doc.text('L\'Officier de l\'État civil,', rightMargin - 200, currentY, { width: 200, align: 'left' });

      // Signature (espace réservé)
      currentY += 30;
      
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text('(Signature)', rightMargin - 200, currentY, { width: 200, align: 'left' });

      // Nom de l'officier
      currentY += 20;
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text(agent?.fullName || 'OUATTARA SOULEYMANE', rightMargin - 200, currentY, { 
           width: 200, 
           align: 'left' 
         });

      currentY += 12;
      
      doc.fontSize(8)
         .font('Helvetica')
         .text('Conseiller Municipal', rightMargin - 200, currentY, { width: 200, align: 'left' });
      
      currentY += 12;
      
      doc.text('Officier d\'Etat - Civil Délégué', rightMargin - 200, currentY, { width: 200, align: 'left' });
      
      currentY += 12;
      
      doc.text(`COMMUNE D'${commune}`, rightMargin - 200, currentY, { width: 200, align: 'left' });

      // Finaliser le PDF
      doc.end();

      // Attendre que le fichier soit écrit
      stream.on('finish', () => {
        resolve({
          filePath: filePath,
          fileName: fileName,
          url: `/extraits/${fileName}`
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Fonction principale pour générer un document selon le type
 */
const generateDocument = async (request, agent) => {
  try {
    let document;
    
    // Récupérer le nom du type de document (peut être un objet ou une string)
    const documentTypeName = typeof request.documentType === 'object' 
      ? request.documentType.name 
      : request.documentType;
    
    // Normaliser le nom pour la comparaison (enlever accents, espaces, etc.)
    const normalizedType = documentTypeName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '_');
    
    // Vérifier si c'est un extrait/acte de naissance
    if (normalizedType.includes('naissance') || 
        normalizedType.includes('birth') ||
        documentTypeName === 'birth_certificate' ||
        documentTypeName === 'birth_declaration') {
      document = await generateBirthExtract(request, agent);
    }
    // Autres types de documents à implémenter
    else if (normalizedType.includes('deces') || normalizedType.includes('death')) {
      throw new Error('Génération d\'acte de décès non encore implémentée');
    }
    else if (normalizedType.includes('mariage') || normalizedType.includes('marriage')) {
      throw new Error('Génération d\'acte de mariage non encore implémentée');
    }
    else {
      throw new Error(`Type de document non supporté: ${documentTypeName}`);
    }

    return document;
  } catch (error) {
    throw new Error(`Erreur lors de la génération du document: ${error.message}`);
  }
};

module.exports = {
  generateDocument,
  generateBirthExtract
};
