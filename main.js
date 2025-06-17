const datetime = new Date();
const patient = new Patient();
const record = new Record();
let bodyfatType = 0;
let visfatType = 1;
let bloodsugarLv = 1;
let bloodsugarType ="";
let bloodpressureType = 1;
let heartrateType = 1;
let lbResult = [];      
let langData = {};

document.getElementById("dateTime").innerHTML = datetime.toLocaleString();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("dateTime").textContent = datetime.toLocaleString();
  
  setupValidation();
  
  document.getElementById("generateBtn").addEventListener("click", generateReport);
  document.getElementById("generatepdf").addEventListener("click", generatePDF);
  document.getElementById("generatecsv").addEventListener("click", generateCSV);
});

function setupValidation() {
  const requiredFields = ['name', 'icno', 'contactno', 'age', 'location'];
  
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => {
        validateField(el, id);
      });
    }
  });
}

function validateField(element, fieldId) {
  const errorElement = document.getElementById(`${fieldId}Error`);
  if (!element.value.trim()) {
    element.classList.add('invalid');
    if (errorElement) {
      errorElement.textContent = 'This field is required';
    }
    return false;
  } else {
    element.classList.remove('invalid');
    if (errorElement) {
      errorElement.textContent = '';
    }
    return true;
  }
}


async function generateReport() {
  const lang = document.getElementById("language").value;
  
  const requiredFields = ['name', 'icno', 'contactno', 'age', 'location'];
  let isValid = true;

  requiredFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (!validateField(element, fieldId)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    alert("Please fill in all required fields");
    return;
  }

  try {
    const response = await fetch('langData.json');
    langData = await response.json();
    const labels = langData[lang];
    if (!labels) return;

    collectFormData();
    
    //FOR #PhysicalTest Result
    let prHtml = getPtResult(labels);    
    //FOR #LiveBloodTest Result
    let lbrHtml = getlbResult(labels);

    const html = `
      <div style="display: flex; flex-direction: column;">
      <div class="headerdiv" style="display: flex; justify-content: space-between;">
      <img src= "bh-logo.png" width="220" height="60">
      <div>
      <h2 style="color: red; margin:0;">Live Blood Test Report</h2>
      <span>${datetime.toLocaleString()}</span>
      </div>
      </div>
      <table id="profile">
        <tr>
          <td><b>${labels.name}</b><br><span>${patient.name}</span></td>
          <td><b>${labels.icno}</b><br><span>${patient.icno}</span></td>
          <td><b>${labels.contactno}</b><br><span>${patient.contactno}</span></td>
        </tr>
        <tr>
          <td><b>${labels.gender}</b><br><span id="genderData">${patient.gender}</span></td>
          <td><b>${labels.age}</b><br><span>${patient.age}</span></td>
          <td><b>${labels.location}</b><br><span>${record.location}</span></td>
        </tr>
      </table>
      <h3 id="langPR">Physical Result</h3>
      <div>
        ${prHtml}
      </div>

    <h3>Live Blood Test Result</h3>
      <div>
        ${lbrHtml}
      </div>
    </div>
    <div style="height: 200px"> </div> 
    `;
    
    document.getElementById("pdfContent").innerHTML = html;
  
    showAdvice(labels);
  
  } catch (err) {
        console.error("Error generating report:", err);
        alert("An error occurred while generating the report");
      }
    }

function collectFormData() {
    patient.name = document.getElementById("name").value;
    patient.icno = document.getElementById("icno").value;
    patient.contactno = document.getElementById("contactno").value;
    patient.gender = document.getElementById("gender").value;
    patient.age = document.getElementById("age").value;
    
    record.location = document.getElementById("location").value;
    record.weight = parseFloat(document.getElementById("weight").value);
    record.height = parseFloat(document.getElementById("height").value);
    record.bmi = record.weight && record.height ? (record.weight / ((record.height / 100) ** 2)).toFixed(1) : null;
    record.bodyfat = document.getElementById("bodyfat").value;
    record.visfat = parseInt(document.getElementById("visfat").value);
    record.bloodsugar = document.getElementById("bloodsugar").value;
    bloodsugarType = document.getElementById("mealtime").selectedOptions[0].value;
    record.bloodpressure1 = document.getElementById("bloodpressure1").value;
    record.bloodpressure2 = document.getElementById("bloodpressure2").value;
    record.heartrate = document.getElementById("heartrate").value;
    record.restm = document.getElementById("restm").value;
    record.bodyage = document.getElementById("bodyage").value;
    record.mealtime = document.getElementById("mealtime").selectedOptions[0].text;
  }

  function showAdvice(labels) {
  if (visfatType > 4) {
    document.getElementById("visfatAdv").textContent = labels.visfatAdv;
  }
  if (record.bodyfat) {
    if (bodyfatType > 4) {
      document.getElementById("bodyfatAdv").textContent = labels.bodyfatAdv2;
    } else if (bodyfatType === 1) {
      document.getElementById("bodyfatAdv").textContent = labels.bodyfatAdv1;
    }
  }
  if (bloodsugarLv > 4) {
    document.getElementById("bloodsugarAdv").textContent = labels.bloodsugarAdv;
  }
  if (bloodpressureType > 2) {
    document.getElementById("bloodpressureAdv").textContent = labels.bloodpressureAdv;
  }  
  if (heartrateType === 3) {
    document.getElementById("heartrateAdv").textContent = labels.heartrateAdv;
  }
}

  function getPtResult(labels){
    
    let prHtml = "";

    let rmradviceText = labels.rmrAdv1;
    let rmrLv = 1;
    let bmiType = 1;

  
      //BODY FAT
      if (patient.gender.toLowerCase() == "male") {
          bodyfatType = 2 + Math.floor((record.bodyfat - 14) / 3);
      } else {
          bodyfatType = 2 + Math.floor((record.bodyfat - 21) / 3);
      }
      if (bodyfatType < 1) bodyfatType = 1;
      if (bodyfatType > 9) bodyfatType = 10;

      //VISCERAL FAT
      if (record.visfat > 9) {
      visfatType = 2 + Math.floor((record.visfat - 9) / 2);
      if (visfatType > 9) visfatType = 10
      }

      //BLOOD SUGAR
      if (bloodsugarType == 0){
        if(record.bloodsugar < 4.4){
          bloodsugarLv = 1;
        }else {
          bloodsugarLv = Math.floor(2 + (record.bloodsugar-4.4)/0.6);
          if(bloodsugarLv > 9) {
            bloodsugarLv = 10;
          }
        }
      } else if (bloodsugarType == 1){
        if(record.bloodsugar < 6.7){
          bloodsugarLv = 1;
        }else {
          bloodsugarLv = Math.floor(2 + (record.bloodsugar-6.7)/0.6);
          if(bloodsugarLv > 9) {
            bloodsugarLv = 10;
          }
        }
      } else if (bloodsugarType == 2){
        if(record.bloodsugar < 5.0){
          bloodsugarLv = 1;
        }else {
          bloodsugarLv = Math.floor(2 + (record.bloodsugar-5.0)/0.6);
          if(bloodsugarLv > 9) {
            bloodsugarLv = 10;
          }
        }
      } else{
        if(record.bloodsugar < 4.4){
          bloodsugarLv = 1;
        }else {
          bloodsugarLv = Math.floor(2 + (record.bloodsugar-4.4)/0.6);
          if(bloodsugarLv > 9) {
            bloodsugarLv = 10;
          }
        }
      }

      if(record.bloodpressure1 <= 65 || record.bloodpressure2 <= 95){
        bloodpressureType = 1;
      }else if (record.bloodpressure1 <= 80 || record.bloodpressure2 <= 120){
        bloodpressureType = 2;
      }else if (record.bloodpressure1 <= 90 || record.bloodpressure2 <= 140){
        bloodpressureType = 3;
      }else if (record.bloodpressure1 <= 100 || record.bloodpressure2 <= 160){
        bloodpressureType = 4;
      }else bloodpressureType = 5;

      if (record.heartrate > 55)
        heartrateType = 2;
      if (record.heartrate > 90) 
        heartrateType = 3;

      let bodyageAdv = labels.bodyageAdv;
      let bodyageType = 1; 
      if(patient.age < record.bodyage) {
        bodyageType = 3;
        bodyageAdv = labels["bodyageAdv"].replace("$status", "higher than");}
      else if (patient.age > record.bodyage) {
        bodyageType = 1;
        bodyageAdv = labels["bodyageAdv"].replace("$status", "younger than");}
      else {
        bodyageType = 2;
        bodyageAdv = labels["bodyageAdv"].replace("$status", "same as");
      }

    if (record.weight){
      prHtml += `<div class="row">
          <div class="column-30">${labels.weight}</div> 
          <div class="column-70">${record.weight}kg</div> 
        </div>`
      }
    if (record.height){
          prHtml += `<div class="row">
              <div class="column-30">${labels.height}</div> 
              <div class="column-70">${record.height}cm</div> 
            </div>`
          } 
    
    if (record.bmi) {
    const idealWeight = `${(record.height/100 * record.height/100 * 18.5).toFixed(1)}kg - ${(record.height/100 * record.height/100 * 25).toFixed(1)}kg`;

    if (record.bmi < 18.5) bmiType = 1;
    else if (record.bmi < 25) bmiType = 2;
    else if (record.bmi < 30) bmiType = 3;
    else if (record.bmi < 35) bmiType = 4;
    else bmiType = 5;

    const bmiadviceText = labels[`bmiAdv${bmiType}`].replace("IdealWeight", idealWeight);

    prHtml += `
      <div class="row">
        <div class="column-30">${labels.bmi}
          <img src="bmi-${patient.gender.toLowerCase().charAt(0)}${bmiType}.png" width="150" alt="BMI indicator">
        </div>
        <div class="column-70">
          <span>${record.bmi}</span>kg/m<sup>2</sup><br>
          <span>${bmiadviceText}</span>
        </div>
      </div>`;
    }
    if (record.bodyfat){
      prHtml += `<div class="row">
          <div class="column-30">${labels.bodyfat}<br>
            <img src="meter-1${bodyfatType}.png" width="200"></div> 
          <div class="column-70">${record.bodyfat}%<br><span id="bodyfatAdv"></span></div> 
        </div>`
      }
    if (record.visfat){
      prHtml += `<div class="row">
          <div class="column-30">${labels.visfat}<br>
            <img src="reading-lv${visfatType}.png" width="200"></div>
          <div class="column-70">${record.visfat}<br><span id="visfatAdv"></span></div>
        </div>`
      }
    if (record.bloodsugar){
      prHtml += `<div class="row">
          <div class="column-30">${labels.bloodsugar}<br>
          <img src="meter-1${bloodsugarLv}.png" width="200"></div>
          <div class="column-70">${record.bloodsugar} mmol/L <br><span id="bloodsugarAdv"></span></div>
        </div>`
      }
    if (!(!record.bloodpressure1 && !record.bloodpressure2)){
      prHtml += `<div class="row">
          <div class="column-30">${labels.bloodpressure}<br>
          <img src="meter-5${bloodpressureType}.png" width="150"></div>
          <div class="column-70">${record.bloodpressure2}/${record.bloodpressure1} mmHg<br><span id="bloodpressureAdv"></span></div>
        </div>`
      }
    if (record.heartrate){
      prHtml += `<div class="row">
          <div class="column-30">${labels.heartrate}<br>
          <img src="meter-3${heartrateType}.png" width="150"></div>
          <div class="column-70">${record.heartrate}bpm<br><span id="heartrateAdv"></span></div>
        </div>`
      }
    if (record.restm){
      if(bmiType > 2 ) {
        rmrLv = 3;
        rmradviceText = labels[`rmrAdv${rmrLv}`].replace("$RMR", record.restm);
      }
      else{
        rmrLv = bmiType;
        rmradviceText = labels[`rmrAdv${rmrLv}`].replace("$RMR", [record.restm*1.5]);
      }

      prHtml += `<div class="row">
          <div class="column-30">${labels.restm}<br>
            <img src="scale-4${rmrLv}.png" width="200"></div>
          <div class="column-70">${record.restm} kcal <br>${rmradviceText}</div>
        </div>`
      }
    if (record.bodyage){
      prHtml += `<div class="row">
        <div class="column-30">${labels.bodyage}<br>
        <img src="scale-5${bodyageType}.png" width="200"></div>
        <div class="column-70">${record.bodyage} yrs<br>${bodyageAdv}</div>
        </div>`
      }

    return prHtml;
  }

  function getlbResult(inlabels){

    const labels = inlabels;
    let lbrHtml = '';

    const metrics = {
      bViscosity: document.getElementById("bViscosity").value,
      bLipid: document.getElementById("bLipid").value,
      bCholesterols: document.getElementById("bCholesterols").value,
      bTRisk: document.getElementById("bTRisk").value,
      bParasite: document.getElementById("bParasite").value,
      mEnergy: document.getElementById("mEnergy").value,
      bMetabolism: document.getElementById("bMetabolism").value,
      anaemia: document.getElementById("anaemia").value,
      gToxins: document.getElementById("gToxins").value,
      malnutrition: document.getElementById("malnutrition").value,
      dDisorder: document.getElementById("dDisorder").value,
      iResistance: document.getElementById("iResistance").value,
      rSystem: document.getElementById("rSystem").value,
      rcIndex: document.getElementById("rcIndex").value,
      lsIndex: document.getElementById("lsIndex").value,
      nsIndex: document.getElementById("nsIndex").value,
      uAcid: document.getElementById("uAcid").value,
    };

      const bloodMetrics = [
        { key: 'bViscosity', label: labels.bViscosity.label, text: labels.bViscosity.text },
        { key: 'bLipid', label: labels.bLipid.label, text: labels.bLipid.text },
        { key: 'bCholesterols', label: labels.bCholesterols.label, text: labels.bCholesterols.text},
        { key: 'bTRisk', label: labels.bTRisk.label, text: labels.bTRisk.text },
        { key: 'bParasite', label: labels.bParasite.label, text: labels.bParasite.text },
        { key: 'mEnergy', label: labels.mEnergy.label, text: labels.mEnergy.text },
        { key: 'bMetabolism', label: labels.bMetabolism.label, text: labels.bMetabolism.text },
        { key: 'anaemia', label: labels.anaemia.label, text: labels.anaemia.text },
        { key: 'gToxins', label: labels.gToxins.label, text: labels.gToxins.text },
        { key: 'malnutrition', label: labels.malnutrition.label, text: labels.malnutrition.text },
        { key: 'dDisorder', label: labels.dDisorder.label, text: labels.dDisorder.text },
        { key: 'iResistance',label:labels.iResistance.label,text:labels.iResistance.text},
        { key: 'rSystem', label: labels.rSystem.label, text: labels.rSystem.text },
        { key: 'rcIndex', label: labels.rcIndex.label, text: labels.rcIndex.text },
        { key: 'lsIndex', label: labels.lsIndex.label, text: labels.lsIndex.text },
        { key: 'nsIndex', label: labels.nsIndex.label, text: labels.nsIndex.text },
        { key: 'uAcid', label: labels.uAcid.label, text: labels.uAcid.text }
      ];

      bloodMetrics.forEach(metric => {
        const value = metrics[metric.key];
        if (value > 0) {
          lbResult.push(metric.label + ": " + value);
          lbrHtml += `
            <div class="row">
            <div class="column-30">${metric.label}<br>
                <img src="meter-1${value}.png" width="200">
              </div>
              <div class="column-70">${metric.text}</div>
            </div>`;
        }
      });

      if (document.getElementById("checkboxbg").checked) {
        lbrHtml += `
            <div class="row">
            <div class="column-30">${labels.bGroup}
              </div>
              <div class="column-70">${document.getElementById("bloodgroup").selectedOptions[0].value}</div>
            </div>`;
          }

      record.addlbResult(lbResult);
      lbResult = [];
      return lbrHtml;
    }

    // PDF Generation
async function generatePDF() {
  const btn = document.getElementById("generatepdf");
  const originalText = btn.textContent;
  
  btn.disabled = true;
  btn.textContent = 'Generating...';
  
  try {
    const element = document.getElementById("pdfContent");
    const opt = {
      margin: 10,
      filename: `${patient.name}_Report.pdf`,
      html2canvas: { scrollY: 0, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// CSV Generation
function generateCSV() {
  const fileName = "patient-record.csv";
  const header = "Patient Name,IC No,Contact No,Gender,Age,Record\n";
  const newRow = `${patient.name},${patient.icno},${patient.contactno},${patient.gender},${patient.age},${JSON.stringify(record)}\n`;
  
  patient.addRecord(record);

  let csvData = localStorage.getItem("csvData");
  if (!csvData) {
    csvData = header + newRow;
  } else {
    csvData += newRow;
  }

  localStorage.setItem("csvData", csvData);
  
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
      //localStorage.removeItem("csvData");
}
