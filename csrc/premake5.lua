-- premake5.lua
workspace "xqt"
   configurations { "Debug", "Release" }
   gccprefix ""
   
   filter "configurations:Debug"
      defines { "DEBUG" }
      symbols "On"

   filter "configurations:Release"
      defines { "NDEBUG" }
      optimize "Speed"

-- QJSUI -----------------------------
project "xqt"
   	kind "SharedLib"
  	language "C++"
	  
  	includedirs { "c:/Qt/Qt6.3.1/6.3.1/mingw_64/include/", "C:/tools/mingw64/x86_64-w64-mingw32/include" }
  	--targetdir "../bin/%{cfg.buildcfg}"
	targetdir "../bin"
	targetname "libxqt"
	-- targetextension ".a"

	objdir "bin/obj/%{cfg.buildcfg}"
	  
	files { "main.cpp" }
	libdirs { "c:/Qt/Qt6.3.1/6.3.1/mingw_64/lib" }
	links { "Qt6Gui", "Qt6Core", "Qt6Widgets" }
	-- defines { "" }
	
	