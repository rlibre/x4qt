import fs from "node:fs"
import path from "node:path"

import { Generator, ASTNode, ASTClass, ASTFunc, ASTSource, _trim, NodeFlags } from "./generators.ts"

const cpp_typemap: any = {
	"void": "void",
	"i32": "int32_t",
	"string": "const char*",
	"pointer": "const void*",
}

export class CppGen extends Generator {
	head: string[] = [];
	code: string[] = [];

	/**
	 * 
	 */

	override generate( basename: string, ast: ASTNode[] ) {
		this.code = [ 
			`#include "${basename}.h"`, 
			`#define DLL_EXPORT __attribute__((visibility("default")))`,
			"" 
		];

		for( const a of ast ) {
			if( a instanceof ASTClass ) {
				cpp_typemap[a.name] = `${a.name}*`;
			}
		}

		for( const a of ast ) {

			if( a instanceof ASTSource ) {
				const c = a.code.trim()
					.split( '\n' )
					.map( x => _trim(x) );

				c.push( "" );

				if( a.name=="cpp_code" ) {
					this.code = this.code.concat( c );
				}
				else if( a.name=="h_code" ) {
					this.head = this.head.concat( c );
				}
			}
		
			if( a instanceof ASTClass ) {
				this._genClass( a );
			}
		}

		// generate cpp files
		//const fpath = path.join("gen_code",basename);
		this._genHeader( basename );
		this._genSource( basename );
	}


	/**
	 * 
	 */

	_genSource( basename: string ) {
		const result = this.code.join("\n");
		fs.writeFileSync( basename+".cpp", result, "utf-8" );
	}

	/**
	 * 
	 */

	_genHeader( basename: string ) {
		const result = this.head.join("\n");
		fs.writeFileSync( basename+".h", result, "utf-8" );
	}

	/**
	 * 
	 */

	_genClass( c: ASTClass ) {

		this.head.push( `// ---- ${c.name} --------------------------`, `extern "C" {` );

		const head: string[] = []
		
		// header
		if( !(c.flags&NodeFlags.abstract) ) {
			head.push( this._mkProto(c.name,c.ctor) );
		}

		for( const f of c.children ) {
			head.push( this._mkProto(c.name,f) );
		}
		
		this.head = this.head.concat( head.map( x => x=="" ? x : "\t"+x+";" ) );
		this.head.push( `}`, "" );

		if( !(c.flags&NodeFlags.abstract) ) {
			this._genCtor( c );
		}
		
		for( const f of c.children ) {
			this._genCode( c, f );
		}
	}

	/**
	 * 
	 */

	_genCode( c: ASTClass, f: ASTFunc ) {
		this.code.push( "DLL_EXPORT" );
		this.code.push( this._mkProto(c.name,f) );

		if( !f.source ) {
			let code = `{\n\t`;

			if( f.type=="string" ) {
				code += "return make_ts_buffer( ";
			}
			else if( f.type!='void' ) {
				code += "return ";
			}
			
			code += `_self->${f.name}( `;

			if( f.params.length ) {
				code += f.params.map( x => x.name ).join( ',' );
			}

			code += " )";
			
			if( f.type=="string" ) {
				code += " )";
			}

			code += `;\n}\n`;
			this.code.push( code );
		}
		else {
			const code = f.source.trim()
								.split( '\n' )
								.map( x => '\t'+x.trim() );

			this.code.push( '{' );
			this.code = this.code.concat( code );
			this.code.push( '}', '' );
		}
	}

	/**
	 * 
	 */

	_genCtor( c: ASTClass ) {
		this.code.push( "DLL_EXPORT" );
		this.code.push( this._mkProto(c.name,c.ctor) );

		if( !c.ctor || !c.ctor.source ) {
			let code = `{\n\treturn new ${c.name}( `;
			if( c.ctor && c.ctor.params.length ) {
				code += c.ctor.params.map( x => x.name ).join( ',' );
			}
			code += ` );\n}\n`;

			this.code.push( code );
		}
		else {
			const code = c.ctor.source.trim()
								.split( '\n' )
								.map( x => '\t'+x.trim() );

			this.code.push( '{' );
			this.code = this.code.concat( code );
			this.code.push( '}', '' );
		}
	}

	/**
	 * 
	 */

	_mkProto( c: string, f: ASTFunc ): string {
		let proto: string;

		// default ctor
		if( !f ) {
			return `void* ${c}_new( )`;
		}

		const params =  []
		
		const ctor = f.name=='constructor';
		if( ctor ) {
			proto = `void* ${c}_new( `;
		}
		else {
			proto = `${this._mkType(f.type)} ${c}__${f.name}( `
			params.push( `${c}* _self` );
		}

		for( const p of f.params ) {
			params.push( `${this._mkType(p.type)} ${p.name}` );
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
		const n = cpp_typemap[t]
		if( !n ) {
			console.error( `unknown type: ${t}` );
		}
		return n;
	}
}
