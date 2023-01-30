import fs from "node:fs"
import path from "node:path"

import { Generator, ASTNode, ASTClass, ASTFunc, ASTSource, _trim, NodeFlags } from "./generators.ts"


const ts_typemap: any = {
	"void": "void",
	"i32": "number",
	"string": "string",
	"pointer": "pointer",
}

const ffi_typemap: any = {
	"void": "void",
	"i32": "i32",
	"string": "buffer",
	"pointer": "pointer",
}

const gen_typemap: any = {
}


export class TsGen extends Generator {

	code: string[];

	override generate( basename: string, ast: ASTNode[] ) {

		this.code = [ ];

		for( const a of ast ) {
			if( a instanceof ASTSource ) {
				const c = a.code.trim()
					.split( '\n' )
					.map( x => _trim(x) );

				c.push( "" );

				if( a.name=="ts_code" ) {
					this.code = this.code.concat( c );
				}
			}
			else if( a instanceof ASTClass ) {
				ffi_typemap[a.name] = "pointer";
				gen_typemap[a.name] = true;
			}
		}

		this.code.push( "",
			"const xqt = Deno.dlopen(",
			"\t'./libxqt.dll',",
			"\t{",
		);

		for( const a of ast ) {
			if( a instanceof ASTClass ) {
				this._genProto( a );
			}
		}

		this.code.push( 
			"\t}", 
			");"
		);
				
		for( const a of ast ) {
			if( a instanceof ASTClass ) {
				this._genClass( a );
			}
		}

		// generate .ts file
		const result = this.code.join("\n");
		fs.writeFileSync( basename+".ts", result, "utf-8" );
	}

	_genProto( c: ASTClass ) {

		
		this.code.push( `\t\t// ---- ${c.name} ---------------------------` );

		if( !(c.flags&NodeFlags.abstract) ) {
			
			let args = "";
			if( c.ctor && c.ctor.params ) {
				args = c.ctor.params.map( x => '"'+this._ffiType(x.type)+'"' ).join(",");
			}
			
			this.code.push( `\t\t"${c.name}_new": { parameters: [${args}], result: "pointer" },` );
		}

		for( const f of c.children ) {
			let args: string[] = [`"pointer"`];

			if( f.params ) {
				args = args.concat( f.params.map( x => '"'+this._ffiType(x.type)+'"' ) );
			}

			this.code.push( `\t\t"${c.name}__${f.name}": { parameters: [${args.join(",")}], result: "${this._ffiType(f.type)}" },` );
		}
	}

	/**
	 * 
	 */
	
	_genClass( c: ASTClass ) {

		this.code.push( "", `export class ${c.name} extends ${c.ext ? c.ext : "QTWrapper"} {` );

		if( !(c.flags&NodeFlags.abstract) ) {
			this._genCode( c, c.ctor, true );
		}
		
		for( const f of c.children ) {
			this._genCode( c, f, false );
		}

		this.code.push( "}" );
		this.code.push( "" );
	}

	/**
	 * 
	 */

	_genCode( c: ASTClass, f: ASTFunc, ctor: boolean ) {
		
		let sig = this._mkProto(c,f,ctor);

		if( !ctor && f && f.type ) {
			sig += ": "+this._mkType( f.type );
		}

		this.code.push( sig+" {\t\t" );

		const is_string = f?.type=="string";		
		let code = '\t\t';
		if( ctor ) {
			code += `super( __inherit ?? xqt.symbols.${c.name}_new( `;
		}
		else {
			if( is_string ) {
				code += "return read_c_str( ";
			}
			else if( f.type!='void' ) {
				code += "return ";
			}

			code += `xqt.symbols.${c.name}__${f.name}( `;
		}
		
		const args = f ? f.params.map( x => this._cvtType(x.type,x.name) ) : [];
		if( !ctor ) {
			args.unshift( "this._self" );
		}
		
		if( args.length ) {
			code += args.join( ',' );
		}
		
		if( ctor ) {
			code += " )";
		}

		if( is_string ) {
			code += " )";
		}
		
		code += " );";

		this.code.push( code );
		this.code.push( "\t}" );
	}

	/**
	 * 
	 */

	_mkProto( c: ASTClass, f: ASTFunc, ctor: boolean): string {
		let proto: string;

		// default ctor
		if( !f ) {
			return `\tconstructor( __inherit?: Deno.PointerValue )`;
		}

		const params =  []
		proto = `\t${f.name}( `;
		
		for( const p of f.params ) {
			params.push( `${p.name}: ${this._mkType(p.type)}` );
		}

		if( ctor ) {
			params.push( "__inherit?: Deno.PointerValue" );
		}

		if( params.length ) {
			proto += params.join( ', ' )+' ';
		}

		proto += ')';
		return proto;
	}

	/**
	 * 
	 */

	_mkType( t: string ) {
		let n = ts_typemap[t];
		if( !n ) {
			if( gen_typemap[t] ) {
				n = t;
			}
			else {
				console.error( `unknown type: ${t}` );
			}
		}
		return n;
	}

	_mkArg( t: string ) {
		return t;
	}

	_ffiType( t: string ) {
		return ffi_typemap[t];
	}

	_cvtType( t: string, n: string ) {
		switch( t ) {
			case 'string':	return `make_c_str(${n})`
			default: {
				if( gen_typemap[t] ) {
					n += "._self";
				}
				
				return n;
			}
		}
	}
}
