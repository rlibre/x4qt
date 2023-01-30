import * as qt from "./qt.ts"

//debugger;
const app = new qt.QApplication( "" );

const frame = new qt.QWidget( );
frame.setWindowTitle( "Deno demo" );
frame.setWindowIcon( "assets/mylogo.png" );

const label = new qt.QLabel( "hello, this is a label" );
const button = new qt.QPushButton( "button" );
const edit = new qt.QLineEdit( );
const medit = new qt.QTextEdit( );

const layout = new qt.QVBoxLayout( );
layout.addWidget( label )
layout.addWidget( button )
layout.addWidget( edit )
layout.addWidget( medit )

frame.setLayout( layout );
frame.show( );

app.exec( );









