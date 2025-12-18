import {NgModule, Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: "chaveValorPipe" })
export class ChaveValorPipe implements PipeTransform {
  transform(object: any): any {
    if (object) {
      console.log('------ Printing keys -------');
      for (let x in object) {
        console.log("key: ", (x+"                  ").substr(0, 18), ", value:", object[x]);
      }
    }
    return null;
  }
}

// @NgModule({
//   imports: [],
//   declarations: [ ChaveValorPipe ],
//   exports: [ ChaveValorPipe ]
// })
// export class ChaveValorModule { }

