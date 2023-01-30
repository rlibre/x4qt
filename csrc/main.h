#pragma once
#include <stdint.h>

#include <QtWidgets/qapplication.h>
#include <QtWidgets/qwidget.h>
#include <QtWidgets/qlayout.h>
#include <QtWidgets/qformlayout.h>
#include <QtWidgets/qlabel.h>
#include <QtWidgets/qpushbutton.h>
#include <QtWidgets/qlineedit.h>
#include <QtWidgets/qtextedit.h>

// ---- QApplication --------------------------
extern "C" {
	void* QApplication_new( const char* cmdline );
	int32_t QApplication__exec( QApplication* _self );
}

// ---- QWidget --------------------------
extern "C" {
	void* QWidget_new( );
	void QWidget__show( QWidget* _self );
	void QWidget__setWindowTitle( QWidget* _self, const char* title );
	void QWidget__setWindowIcon( QWidget* _self, const char* icon );
	void QWidget__setLayout( QWidget* _self, QLayout* layout );
}

// ---- QLayout --------------------------
extern "C" {
}

// ---- QHBoxLayout --------------------------
extern "C" {
	void* QHBoxLayout_new( );
}

// ---- QVBoxLayout --------------------------
extern "C" {
	void* QVBoxLayout_new( );
	void QVBoxLayout__addWidget( QVBoxLayout* _self, QWidget* widget );
}

// ---- QFormLayout --------------------------
extern "C" {
	void* QFormLayout_new( );
}

// ---- QLabel --------------------------
extern "C" {
	void* QLabel_new( const char* text );
	void QLabel__setText( QLabel* _self, const char* text );
	const char* QLabel__text( QLabel* _self );
}

// ---- QPushButton --------------------------
extern "C" {
	void* QPushButton_new( const char* text );
	void QPushButton__setText( QPushButton* _self, const char* text );
	const char* QPushButton__text( QPushButton* _self );
}

// ---- QLineEdit --------------------------
extern "C" {
	void* QLineEdit_new( );
	void QLineEdit__setText( QLineEdit* _self, const char* text );
	const char* QLineEdit__text( QLineEdit* _self );
}

// ---- QTextEdit --------------------------
extern "C" {
	void* QTextEdit_new( );
	void QTextEdit__setText( QTextEdit* _self, const char* text );
	const char* QTextEdit__toPlainText( QTextEdit* _self );
}
