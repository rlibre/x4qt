#include "../csrc/main.h"
#define DLL_EXPORT __attribute__((visibility("default")))

#include <QtCore/qdir.h>

const char* make_ts_buffer( const QString& r ) {
	static QByteArray ba;
	
	QByteArray b = r.toUtf8();
	uint32_t ln = (uint32_t)b.length();
	uint8_t len[4] = { uint8_t(ln>>24), uint8_t(ln>>16), uint8_t(ln>>8), uint8_t(ln) };

	b.insert( 0, (char*)len, 4 );
	return b.data( );
}

DLL_EXPORT
void* QApplication_new( const char* cmdline )
{
	QDir cwd;
	QString app = cwd.absolutePath( );
	
	QStringList paths = QStringList( )
	<< app.append( "/plugins" )
	<< app.append( "/plugins/platforms" );
	
	QApplication::setLibraryPaths( paths );
	
	
	static int n = 1;
	static char* a[] = { (char*)cmdline };
	return new QApplication( n, a );
}

DLL_EXPORT
int32_t QApplication__exec( QApplication* _self )
{
	return _self->exec(  );
}

DLL_EXPORT
void* QWidget_new( )
{
	return new QWidget(  );
}

DLL_EXPORT
void QWidget__show( QWidget* _self )
{
	_self->show(  );
}

DLL_EXPORT
void QWidget__setWindowTitle( QWidget* _self, const char* title )
{
	_self->setWindowTitle( title );
}

DLL_EXPORT
void QWidget__setWindowIcon( QWidget* _self, const char* icon )
{
	_self->setWindowIcon( QIcon(icon) );
}

DLL_EXPORT
void QWidget__setLayout( QWidget* _self, QLayout* layout )
{
	_self->setLayout( layout );
}

DLL_EXPORT
void* QHBoxLayout_new( )
{
	return new QHBoxLayout(  );
}

DLL_EXPORT
void* QVBoxLayout_new( )
{
	return new QVBoxLayout(  );
}

DLL_EXPORT
void QVBoxLayout__addWidget( QVBoxLayout* _self, QWidget* widget )
{
	_self->addWidget( widget );
}

DLL_EXPORT
void* QFormLayout_new( )
{
	return new QFormLayout(  );
}

DLL_EXPORT
void* QLabel_new( const char* text )
{
	return new QLabel( text );
}

DLL_EXPORT
void QLabel__setText( QLabel* _self, const char* text )
{
	_self->setText( text );
}

DLL_EXPORT
const char* QLabel__text( QLabel* _self )
{
	return make_ts_buffer( _self->text(  ) );
}

DLL_EXPORT
void* QPushButton_new( const char* text )
{
	return new QPushButton( text );
}

DLL_EXPORT
void QPushButton__setText( QPushButton* _self, const char* text )
{
	_self->setText( text );
}

DLL_EXPORT
const char* QPushButton__text( QPushButton* _self )
{
	return make_ts_buffer( _self->text(  ) );
}

DLL_EXPORT
void* QLineEdit_new( )
{
	return new QLineEdit(  );
}

DLL_EXPORT
void QLineEdit__setText( QLineEdit* _self, const char* text )
{
	_self->setText( text );
}

DLL_EXPORT
const char* QLineEdit__text( QLineEdit* _self )
{
	return make_ts_buffer( _self->text(  ) );
}

DLL_EXPORT
void* QTextEdit_new( )
{
	return new QTextEdit(  );
}

DLL_EXPORT
void QTextEdit__setText( QTextEdit* _self, const char* text )
{
	_self->setText( text );
}

DLL_EXPORT
const char* QTextEdit__toPlainText( QTextEdit* _self )
{
	return make_ts_buffer( _self->toPlainText(  ) );
}
