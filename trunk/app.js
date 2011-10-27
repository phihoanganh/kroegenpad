// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

//
// create base UI tab and root window
//
var win = Titanium.UI.createWindow({  
    title:'Waar ben ik',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Jij',
    window:win
});

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({
	url:'main_windows/search_places.js',
	titleid:'controls_win_title',
	title: 'Overzicht'
});
var tab2 = Titanium.UI.createTab({
	icon:'images/tabs/KS_nav_ui.png',
	titleid:'controls_win_title',
	title: 'Kroegen',
	window:win2
});


Ti.include('examples/geolocation.js');
//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
