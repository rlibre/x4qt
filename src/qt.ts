import { Buffer } from "node:buffer"

const stdEncoder = new TextEncoder();

function make_c_str( str: string ) : Uint8Array {
	// small hack, i add a zero terminal for the c part
	return stdEncoder.encode(str+"\u0000");	
}

function read_c_str( input: Deno.PointerValue ): string {
	debugger;
	return "";
}

function make_c_buffer( buf: Buffer ) {
	const ln = buf.length;
	const rc = Buffer.allocUnsafe( ln+4 );
	
	rc.writeUint32BE( ln, 0 );
	rc.set( buf, 4 );
	return rc;
}

class QTWrapper {
	protected _self;
	constructor( self: any ) { 
		console.assert( self!=null );
		this._self = self; 
	}
}


const xqt = Deno.dlopen(
	'./libxqt.dll',
	{
		// ---- QApplication ---------------------------
		"QApplication_new": { parameters: ["buffer"], result: "pointer" },
		"QApplication__exec": { parameters: ["pointer"], result: "i32" },
		// ---- QWidget ---------------------------
		"QWidget_new": { parameters: [], result: "pointer" },
		"QWidget__show": { parameters: ["pointer"], result: "void" },
		"QWidget__setWindowTitle": { parameters: ["pointer","buffer"], result: "void" },
		"QWidget__setWindowIcon": { parameters: ["pointer","buffer"], result: "void" },
		"QWidget__setLayout": { parameters: ["pointer","pointer"], result: "void" },
		// ---- QLayout ---------------------------
		// ---- QHBoxLayout ---------------------------
		"QHBoxLayout_new": { parameters: [], result: "pointer" },
		// ---- QVBoxLayout ---------------------------
		"QVBoxLayout_new": { parameters: [], result: "pointer" },
		"QVBoxLayout__addWidget": { parameters: ["pointer","pointer"], result: "void" },
		// ---- QFormLayout ---------------------------
		"QFormLayout_new": { parameters: [], result: "pointer" },
		// ---- QLabel ---------------------------
		"QLabel_new": { parameters: ["buffer"], result: "pointer" },
		"QLabel__setText": { parameters: ["pointer","buffer"], result: "void" },
		"QLabel__text": { parameters: ["pointer"], result: "buffer" },
		// ---- QPushButton ---------------------------
		"QPushButton_new": { parameters: ["buffer"], result: "pointer" },
		"QPushButton__setText": { parameters: ["pointer","buffer"], result: "void" },
		"QPushButton__text": { parameters: ["pointer"], result: "buffer" },
		// ---- QLineEdit ---------------------------
		"QLineEdit_new": { parameters: [], result: "pointer" },
		"QLineEdit__setText": { parameters: ["pointer","buffer"], result: "void" },
		"QLineEdit__text": { parameters: ["pointer"], result: "buffer" },
		// ---- QTextEdit ---------------------------
		"QTextEdit_new": { parameters: [], result: "pointer" },
		"QTextEdit__setText": { parameters: ["pointer","buffer"], result: "void" },
		"QTextEdit__toPlainText": { parameters: ["pointer"], result: "buffer" },
	}
);

export class QApplication extends QTWrapper {
	constructor( cmdline: string, __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QApplication_new( make_c_str(cmdline) ) );
	}
	exec( ): number {		
		return xqt.symbols.QApplication__exec( this._self );
	}
}


export class QWidget extends QTWrapper {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QWidget_new(  ) );
	}
	show( ): void {		
		xqt.symbols.QWidget__show( this._self );
	}
	setWindowTitle( title: string ): void {		
		xqt.symbols.QWidget__setWindowTitle( this._self,make_c_str(title) );
	}
	setWindowIcon( icon: string ): void {		
		xqt.symbols.QWidget__setWindowIcon( this._self,make_c_str(icon) );
	}
	setLayout( layout: QLayout ): void {		
		xqt.symbols.QWidget__setLayout( this._self,layout._self );
	}
}


export class QLayout extends QTWrapper {
}


export class QHBoxLayout extends QLayout {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QHBoxLayout_new(  ) );
	}
}


export class QVBoxLayout extends QLayout {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QVBoxLayout_new(  ) );
	}
	addWidget( widget: QWidget ): void {		
		xqt.symbols.QVBoxLayout__addWidget( this._self,widget._self );
	}
}


export class QFormLayout extends QLayout {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QFormLayout_new(  ) );
	}
}


export class QLabel extends QWidget {
	constructor( text: string, __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QLabel_new( make_c_str(text) ) );
	}
	setText( text: string ): void {		
		xqt.symbols.QLabel__setText( this._self,make_c_str(text) );
	}
	text( ): string {		
		return read_c_str( xqt.symbols.QLabel__text( this._self ) );
	}
}


export class QPushButton extends QWidget {
	constructor( text: string, __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QPushButton_new( make_c_str(text) ) );
	}
	setText( text: string ): void {		
		xqt.symbols.QPushButton__setText( this._self,make_c_str(text) );
	}
	text( ): string {		
		return read_c_str( xqt.symbols.QPushButton__text( this._self ) );
	}
}


export class QLineEdit extends QWidget {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QLineEdit_new(  ) );
	}
	setText( text: string ): void {		
		xqt.symbols.QLineEdit__setText( this._self,make_c_str(text) );
	}
	text( ): string {		
		return read_c_str( xqt.symbols.QLineEdit__text( this._self ) );
	}
}


export class QTextEdit extends QWidget {
	constructor( __inherit?: Deno.PointerValue ) {		
		super( __inherit ?? xqt.symbols.QTextEdit_new(  ) );
	}
	setText( text: string ): void {		
		xqt.symbols.QTextEdit__setText( this._self,make_c_str(text) );
	}
	toPlainText( ): string {		
		return read_c_str( xqt.symbols.QTextEdit__toPlainText( this._self ) );
	}
}
