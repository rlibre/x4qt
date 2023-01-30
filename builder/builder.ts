import fs from "node:fs"

import { ASTNode, ASTClass, ASTFunc, ASTParam, ASTSource, NodeFlags } from "./generators.ts"
import { CppGen } from "./cpp_generator.ts";
import { TsGen } from "./ts_generator.ts";


console.log( "loading source..." );

interface Token {
	text: string;
	pos: number;
}


class Parser {
	private _src: string = null;
	private _tokens: Token[] = null;
	private _pos = 0;
	private _elements: ASTNode[] = null;

	parse( filename: string ) {
		const source = fs.readFileSync( filename, "utf-8" );
		this._src = source;
		this._tokens = this.tokenize( source );
		this._pos = 0;
		this._elements = [];
		return this._parse( );
	}

	tokenize( x: string ): Token[] {
		
		const elements = [];
		const re = /([a-zA-Z_@][a-zA-Z0-9_]*|\S)\s*/y;

		while( true ) {
			const m = re.exec( x );
			if( !m ) {
				break;
			}

			elements.push( {
				text: m[1].trim( ),
				pos: m.index 
			} );
		}

		//const elements = x.split( "" );

		return elements;
	}
	
	next_token( ) {
		return this._tokens[this._pos++].text;
	}

	peek_token( ): string {
		return this._tokens[this._pos].text;
	}

	eof( ): boolean {
		return this._pos>=this._tokens.length;
	}

	expect( text: string ) {
		const token = this._tokens[this._pos++];

		const findLine = ( pos: number ) => {
			let lno = 1;
			for( let i=0; i<pos; i++ ) {
				if( this._src.charCodeAt(i)==10 ) {
					lno++;
				}
			}
			return lno;
		}

		if( token.text!=text ) {
			console.error( `${text} expected\nat line ${findLine(token.pos)}` );
		}
	}

	parse_class_decl( ): ASTNode {
		const name = this.next_token( );
		const node = new ASTClass( name );
		
		if( this.peek_token( )=="extends" ) {
			this.next_token( );
			node.ext = this.next_token( );
		}

		this.expect( "{" );
			
		let pk: string;
		while( !this.eof() && (pk=this.peek_token())!='}' ) {

			if( pk.charAt(0)=="@" ) {
				this.next_token( );
				switch( pk ) {
					case "@abstract": {
						node.flags |= NodeFlags.abstract;
						break;
					}

					default: {
						console.error( `unknown directive: ${pk}` );
					}
				}

				continue;
			}

			const f = this.parse_func_decl( );
			if( f.name=='constructor' ) {
				node.ctor = f;
			}
			else {
				node.children.push( f );
			}
		}

		this.expect( "}" );
		return node;
	}

	parse_func_decl( ): ASTFunc {
		const name = this.next_token( );
		const node = new ASTFunc( name );

		this.expect( "(" );

		let cnt = 0;
		while( !this.eof() && this.peek_token()!=')' ) {

			if( cnt ) {
				this.expect( "," )
			}

			const aname = this.next_token( )
			this.expect( ":" );
			const type = this.next_token( )

			const param = new ASTParam( aname, type );

			node.params.push( param );
			cnt++;
		}

		this.expect( ")" );

		if( this.peek_token()==":" ) {
			this.next_token( );
			node.type = this.next_token( );
		}

		if( this.peek_token()=='{' ) {
			node.source = this._parseSource( );
		}
		else if( this.peek_token()==';' ) {
			this.next_token( );
		}

		return node;
	}

	_parseSource( ) {
		const tk = this._tokens[this._pos++];

		let lvl = 0;
		let pos = tk.pos;

		while( pos<this._src.length ) {
			const ch = this._src.charAt(pos++);
			if( ch=='{' ) {
				lvl++;
			}
			else if( ch=='}' ) {
				lvl--;
				if( lvl==0 ) {
					break;
				}
			}
		}

		const source = this._src.substring( tk.pos+1, pos-1 );

		let sync = this._pos;
		while( this._tokens[sync] && this._tokens[sync].pos<pos ) {
			sync++;
		}
		this._pos = sync;

		return source;
	}

	_parse( ) {
		while( !this.eof() ) {
			const h = this.next_token( );
			switch( h ) {
				case "h_code":
				case "ts_code":
				case "cpp_code": {
					const n = new ASTSource( h );
					n.code = this._parseSource( );
					this._elements.push( n );
					break;
				}

				case "class": {
					this._elements.push( this.parse_class_decl( ) );
					break;
				}

				case "function": {
					this._elements.push( this.parse_func_decl( ) );
					break;
				}

				default: {
					console.error( "unexpected input ", h );
					break;
				}
			}
		}

		console.log( this._elements );
		return this._elements;
	}
} 



const parser = new Parser( );
const ast = parser.parse( "definitions.idl" );

const cpp = new CppGen( );
cpp.generate( "../csrc/main", ast );

const ts = new TsGen( );
ts.generate( "../src/qt", ast );






