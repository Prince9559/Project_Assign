
// backend/controllers/AadhaarKycController.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const xml2js = require('xml2js');

const CERT_PATH = path.join(__dirname, '..', 'certs', 'uidai_offline_kyc.cer');


const HARDCODED_XML = `<OfflinePaperlessKyc referenceId="925020190122165455195">
<UidData>
<Poi dob="02-11-1995" e="076586c63449b7bd6be397...." gender="male" m="b6ecbb2c0f9b5678de8bce3bcd8155..." name="Madhu n"/>
<Poa country="#COUNTRY" dist="kozhikode" house="valanattu house update1" loc="malaparamba update1" pc="673009" po="malaparamba" state="32" street="malaparamba update1" subdist="005420" vtc="malaparamba"/>
<Pht>/9j/4AAQSkZJRgABAgAAAQABAAD.....</Pht>
</UidData>
<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
<DigestValue>WYqBFc...</DigestValue>
</Reference>
</SignedInfo>
<SignatureValue>fUledlM0faNmeJiDrZc2/...</SignatureValue>
<KeyInfo>
<X509Data>
<X509SubjectName>CN=hcl-aua,OU=hcl-aua...</X509SubjectName>
<X509Certificate>MIIDjTCCAnWgAwIBAgIEYhPg...</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>
</OfflinePaperlessKyc>`;

const testHardcodedKyc = (req, res) => {
  console.log('\n Starting KYC verification...');

  if (!fs.existsSync(CERT_PATH)) {
    console.error(' Cert file not found at:', CERT_PATH);
    return res.status(500).json({ error: 'Public certificate missing' });
  }

  // Step 1: Extract <SignatureValue>
  const sigMatch = HARDCODED_XML.match(/<SignatureValue>([^<]+)<\/SignatureValue>/);
  if (!sigMatch) {
    console.error(' SignatureValue not found in XML');
    return res.status(400).json({ error: 'Invalid XML: Signature missing' });
  }
  const signatureBase64 = sigMatch[1].trim();
  console.log(' Signature extracted (length):', signatureBase64.length);

  // Step 2: Remove ENTIRE <Signature>...</Signature> block
  const xmlWithoutSignature = HARDCODED_XML
    .replace(/<Signature[^>]*>[\s\S]*<\/Signature>/, '')
    .trim();

  console.log(' XML without Signature (first 100 chars):', xmlWithoutSignature.substring(0, 100));

  // Step 3: Load UIDAI public cert
  const cert = fs.readFileSync(CERT_PATH, 'utf8');
  console.log(' Cert loaded');

  // Step 4: Verify signature
  try {
    const verifier = crypto.createVerify('RSA-SHA256'); // ← SHA256, NOT SHA1!
    verifier.update(xmlWithoutSignature, 'utf8');
    const isValid = verifier.verify(cert, Buffer.from(signatureBase64, 'base64'));

    console.log('Signature valid?', isValid);

    if (!isValid) {
      return res.status(400).json({ error: 'Digital signature verification failed' });
    }

    // Step 5: Parse data (for display)
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(HARDCODED_XML, (err, result) => {
      if (err) return res.status(500).json({ error: 'XML parse failed' });

      const poi = result.OfflinePaperlessKyc?.UidData?.Poi?.$ || {};
      res.json({
        success: true,
        name: poi.name,
        dob: poi.dob,
        gender: poi.gender,
        referenceId: result.OfflinePaperlessKyc?.$?.referenceId,
        message: ' Aadhaar Offline e-KYC verified!'
      });
    });

  } catch (e) {
    console.error(' Verification error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

module.exports = { testHardcodedKyc };

