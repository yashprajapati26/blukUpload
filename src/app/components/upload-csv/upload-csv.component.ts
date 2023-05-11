import { Component, HostListener } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { errors } from 'src/app/interfaces/errors.interface';
import { success } from 'src/app/interfaces/success.interface';
import * as XLSX from "xlsx";
import { UploadCsvService } from './upload-csv.service';

@Component({
  selector: 'app-upload-csv',
  templateUrl: './upload-csv.component.html',
  styleUrls: ['./upload-csv.component.scss']
})
export class UploadCsvComponent {

  constructor(private uploadcsvservice: UploadCsvService,
    private ngxLoader: NgxUiLoaderService,
  ) { }

  SuccessOptions = {
    filename: "success",
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: false,
    headers: ['prefix', 'first_name', 'last_name', 'email', 'phone_no', 'age'],
    showTitle: false,
    title: '',
    useBom: false,
    removeNewLines: true,
    keys: ['prefix', 'first_name', 'last_name', 'email', 'phone_no', 'age']
  };

  ErrorOptions = {
    filename: "errors",
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: false,
    headers: ['prefix', 'first_name', 'last_name', 'email', 'phone_no', 'age', 'errors'],
    showTitle: false,
    title: '',
    useBom: false,
    removeNewLines: true,
    keys: ['prefix', 'first_name', 'last_name', 'email', 'phone_no', 'age', 'errors']
  };

  files: any[] = []
  sucessFile!: string;
  errorFile!: string;
  msg: string | undefined;
  errmsg: string | undefined
  successArray: success[] | undefined
  errorsArray: errors[] | undefined
  ngOnInit() { }
  arr: any[] = []
  disable: boolean = false;

  submit() {

    let formData = new FormData;
    for (let i = 0; i < this.files.length; i++) {
      formData.append("files", this.files[i], this.files[i]['name']);
    }
    if (this.files.length > 0) {
      this.ngxLoader.start();

      this.uploadcsvservice.upload(formData).subscribe((res: any) => {
        console.log(res)
        this.msg = res['msg']
        this.sucessFile = res.data['success'];
        this.errorFile = res.data['errors'];
        this.successArray = res.data['successArray']
        this.errorsArray = res.data['errorsArray']
        this.createExcelSheet()
        this.ngxLoader.stop();
        this.files = [];
      }, (err: any) => {
        console.log("err : ", err)
        this.errmsg = err.error.msg
        this.ngxLoader.stop();

      })
    } else {
      this.errmsg = "please select file"
    }

    setTimeout(() => {
      this.msg = undefined;
      this.errmsg = undefined;
    }, 4000);

  }

  selectedFiles(event: any) {
    let type = event.target.files[0].type;
    console.log(type)
    this.msg = undefined
    if (type != "text/csv") {
      this.errmsg = "please select 'csv' file"
    } else {
      this.errmsg = undefined
      this.files = <Array<File>>event.target.files;
      this.disable = true

    }
    setTimeout(() => {
      this.msg = undefined;
      this.errmsg = undefined
    }, 4000);
    console.log(this.files);
    console.log("files :", this.files)
  }

  @HostListener('dragover', ['$event']) public onDragOnOver(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log("called ... drag over")
  }


  @HostListener('dragleave', ['$event']) public onDragOnLeave(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log("called ... leave drag")
  }

  @HostListener('drop', ['$event']) public ondrop(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log("called ... drop")
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      console.log(`you dropeed ${files.length} files`, files)
    }
    let type = files[0].type;
    if (files.length > 1) this.errmsg = "Only one file at time allow";
    else {
      if (type != "text/csv") {
        this.errmsg = "please select 'csv' file"
      }
      else {
        this.files = []
        this.errmsg = undefined;
        for (const item of files) {
          this.files.push(item);
        }
        this.disable = true
      }
    }
    setTimeout(() => {
      this.msg = undefined;
      this.errmsg = undefined;
    }, 4000);
  }

  onFileDropeed($event: any) {
    if (this.files.length > 1) this.errmsg = "Only one file at time allow";
    else {
      this.errmsg = undefined;
      for (const item of $event) {
        this.files.push(item);
      }
    }
    console.log("files :", this.files)
  }


  createExcelSheet() {
    const fileName = "results.xlsx";
    const sheetName = ["success", "errors",];
    this.arr = [this.successArray, this.errorsArray]
    console.log("arr --> ", this.arr)
    let wb = XLSX.utils.book_new();
    console.log("wb --> ", wb)
    for (var i = 0; i < sheetName.length; i++) {
      let ws = XLSX.utils.json_to_sheet(this.arr[i]);
      console.log("ws --> ", ws)

      XLSX.utils.book_append_sheet(wb, ws, sheetName[i]);
    }
    XLSX.writeFile(wb, fileName);
  }


}

