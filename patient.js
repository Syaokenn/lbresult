class Patient {
  constructor() 
  {
    this.name = "";
    this.icno = "";
    this.contactno = "";
    this.gender = "";
    this.age = "";
    this.records = [];
  }
  
  addRecord(record) {
    this.records.push(record);
  }

}

class Record {
  constructor() {
    this.datetime = new Date();
    this.location = "";
    this.weight = "";
    this.height = "";
    this.bmi = "";
    this.bodyfat = "";
    this.visfat = "";
    this.bloodsugar = "";
    this.bloodpressure1 = "";
    this.bloodpressure2 = "";
    this.heartrate = "";
    this.restm = "";
    this.bodyage = "";
    this.mealtime = "";
    this.lbResults = [];
  }

  addlbResult(result) {
    this.lbResults.push(result);
  }
}