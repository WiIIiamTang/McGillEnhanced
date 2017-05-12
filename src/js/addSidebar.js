/*
McGill Enhanced is a chrome extension that improves the functionality and navigability of McGill.ca
Copyright (C) 2016 Demetrios Koziris

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

A copy of the GNU General Public License is provided in the LICENSE.txt file along with this program.  
The GNU General Public License can also be found at <http://www.gnu.org/licenses/>.
*/

//jshint esversion: 6


function makeSidebarContent() {

	document.getElementById("main-column").className += " mcen-main-column";

	const urlCourseName = url.match(/courses\/([A-Za-z]{3,4}[0-9]{0,1}-[0-9]{3}[A-Za-z]{0,1}[0-9]{0,1})/)[1].toUpperCase();
	const courseSubject = urlCourseName.split("-")[0];
	const courseNumber = urlCourseName.split("-")[1];
	const courseName = courseSubject + courseNumber;
	const courseNameSpaced = courseSubject + " " + courseNumber;

	const recordingURLdata = getRecordingData()[courseName];
	const recordingsBaseURLs = getRecordingsBaseURLs();
	const monthToSemester = getMonthToSemester();
	const wikinotesURLdata = getWikinotesData()[courseName];
	const docuumURLdata = getDocuumData()[courseName];

	const vsbSidebarTerms = [];
	getVSBSemesters(vsbSidebarTerms);
	const withinyearRangeVSB = (sysYear==urlYearF) || (sysYear==urlYearW && sysMonth<3);

	const courseTerms = document.getElementsByClassName("catalog-terms")[0].innerHTML;
	const courseTermsCodes = [];
	if (courseTerms.match(termNames[lang][9])) {
		courseTermsCodes.push( {
			name: "Fall " + urlYearF,  
			code: urlYearF + "09",
			vsbURL: "https://vsb.mcgill.ca/vsb/criteria.jsp?term=" + urlYearF + "09&course_0_0=" + courseSubject + "-" + courseNumber + "&ca_0_0=&bbs="
		} );
	}
	if (courseTerms.match(termNames[lang][1])) {
		courseTermsCodes.push( {
			name: "Winter " + urlYearW,  
			code: urlYearW + "01",
			vsbURL: "https://vsb.mcgill.ca/vsb/criteria.jsp?term=" + urlYearW + "01&course_0_0=" + courseSubject + "-" + courseNumber + "&ca_0_0=&bbs="
		} );
	}
	if (courseTerms.match(termNames[lang][05])) {
		courseTermsCodes.push( {
			name: "Summer " + urlYearW,  
			code: urlYearW + "05"
		} );
	}
	logForDebug(courseTermsCodes);

	const newContent = document.getElementById("main-column").innerHTML;
	const courses = newContent.match(/[A-Z]{3,4}[0-9]{0,1}\s[0-9]{3}[A-Za-z]{0,1}[0-9]{0,1}/g);
	const depsDup = [courseSubject];
	if (courses) {
		for (let c=0; c<courses.length; c++) {
			depsDup.push(courses[c].split(" ")[0]);
		}
	}
	logForDebug(depsDup);
	const deps = depsDup.filter(function(elem, pos) {
		return depsDup.indexOf(elem) === pos;
	});


	const sidebar = document.createElement('div');
	sidebar.className += " mcen-sidebar";
	sidebar.id = "sidebar-column";

	const sidebarLinksBlock = document.createElement('div');  
	sidebarLinksBlock.className += " mcen-sidebarLinksBlock";  
	sidebar.appendChild(sidebarLinksBlock);


	//SIDEBAR SUPER SECTION (YEAR SPECIFIC)
	const registrationSidebarContentExists = courseTermsCodes.length > 0;
	const vsbSidebarContentExists = withinyearRangeVSB && courseTermsCodes.length > 0;
	if (registrationSidebarContentExists || vsbSidebarContentExists) {

		sidebarLinksBlock.appendChild(generateSidebarSectionSeparator(urlYearF+'-'+urlYearW));

		if (registrationSidebarContentExists) {
			//SIDEBAR SECTION: MINERVA REGISTRATION
			const courseReg = generateSidebarSection("Minerva Registration");
			sidebarLinksBlock.appendChild(courseReg);

			for (let i = 0; i < courseTermsCodes.length; i++) {
				const courseRegURL = "https://horizon.mcgill.ca/pban1/bwskfcls.P_GetCrse_Advanced?rsts=dummy&crn=dummy&term_in=" + courseTermsCodes[i].code + "&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=" + courseSubject + "&sel_coll=&sel_crse=" + courseNumber + "&sel_title=&sel_schd=&sel_from_cred=&sel_to_cred=&sel_levl=&sel_ptrm=%25&sel_instr=%25&sel_attr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a&path=1&SUB_BTN=&";
				const courseRegButtonString = "View " + courseTermsCodes[i].name + " Registration";
				courseReg.appendChild(generateSidebarLink(courseRegURL, "mcen-red", courseRegButtonString, true));   
			}
		}

		if (vsbSidebarContentExists) {
			//SIDEBAR SECTION: VISUAL SCHEDULE BUILDER
			const vsb = generateSidebarSection("Visual Schedule Builder");
			sidebarLinksBlock.appendChild(vsb);

			for (let i = 0; i < courseTermsCodes.length; i++) {
				const term = courseTermsCodes[i];
				if (term.vsbURL) {
					const vsbButtonString = "View on VSB " + term.name;
					const vsbLink = generateSidebarLink(term.vsbURL, "mcen-purple mcen-vsb" + term.code, vsbButtonString, false);
					vsb.appendChild(vsbLink);
					vsbSidebarTerms.push(term.code);
				} 
			}
		}

		sidebarLinksBlock.appendChild(document.createElement('br'));
	}

	//SIDEBAR SUPER SECTION (COURSE SPECIFIC)
	sidebarLinksBlock.appendChild(generateSidebarSectionSeparator(courseNameSpaced));

	//SIDEBAR SECTION: COURSE REVIEWS
	const courseEval = generateSidebarSection("Course Reviews");
	sidebarLinksBlock.appendChild(courseEval);

	if (docuumURLdata) { 
		const docuumURL = "http://www.docuum.com/McGill/review/read_course/" + docuumURLdata;
		const docuumButtonString = "View Docuum Course Reviews";
		courseEval.appendChild(generateSidebarLink(docuumURL, "mcen-blue", docuumButtonString, false));
	}

	const mercuryURL = 'https://horizon.mcgill.ca/pban1/bzskmcer.p_display_form?form_mode=ar&subj_tab_in='+courseSubject+'&crse_in='+courseNumber;
	const mercuryButtonString = "View Mercury Course Evaluations";
	courseEval.appendChild(generateSidebarLink(mercuryURL, "mcen-red", mercuryButtonString, true));

	
	//SIDEBAR SECTION: LECTURE RECORDINGS
	const availableRecordingURLdata = [];
	const oldestAvailableTerm = getOldestAvailableRecordingTerm();
	if (recordingURLdata) {
		for (let i = 0; i < recordingURLdata.length; i++) {
			if (recordingURLdata[i].year + ('0'+recordingURLdata[i].month).slice(-2) >= oldestAvailableTerm) {
				availableRecordingURLdata.push(recordingURLdata[i]);
			}
		}
	}
	logForDebug(availableRecordingURLdata);
	if (availableRecordingURLdata) {
		const recordings = generateSidebarSection("Lecture Recordings");
		sidebarLinksBlock.appendChild(recordings);

		for (let r = 0; r < availableRecordingURLdata.length; r++) {
			const recordingData = availableRecordingURLdata[r];
			const recordingURL = recordingsBaseURLs[recordingData.type] + recordingData.id;
			const recordingsButtonString = "View " + monthToSemester[recordingData.month] + " " + recordingData.year + " Sec " + recordingData.section + " Lectures";
			recordings.appendChild(generateSidebarLink(recordingURL, "mcen-red", recordingsButtonString, false));
		}
	}  


	if ( docuumURLdata || wikinotesURLdata) {

		//SIDEBAR SECTION: OTHER RESOURCES
		const other = generateSidebarSection("Other Resources");
		sidebarLinksBlock.appendChild(other);
	
		if (docuumURLdata) {
			const docuumURL = "http://www.docuum.com/McGill/document/view_class/" + docuumURLdata;
			const docuumButtonString = "View " + courseNameSpaced + " on Docuum";
			other.appendChild(generateSidebarLink(docuumURL, "mcen-blue", docuumButtonString, false));
		}
		if (wikinotesURLdata) {
			const wikinotesURL = "https://www.wikinotes.ca/" + wikinotesURLdata;
			const wikinotesButtonString = "View " + courseNameSpaced + " on Wikinotes";
			other.appendChild(generateSidebarLink(wikinotesURL, "mcen-white", wikinotesButtonString, false));
		}
	}

	sidebarLinksBlock.appendChild(document.createElement('br'));

	//SIDEBAR SUPER SECTION (RELATED)
	sidebarLinksBlock.appendChild(generateSidebarSectionSeparator('RELATED'));

	if (deps.length > 0) {

		//SIDEBAR SECTION: RELATED COURSES
		const relatedCourses = generateSidebarSection("Course Subjects");
		sidebarLinksBlock.appendChild(relatedCourses);

		for (let i = 0; i < deps.length; i++) {
			const relatedURL = "https://www.mcgill.ca/study/" + urlYears + "/courses/search?f[0]=field_subject_code%3A" + deps[i];
			const relatedButtonString = "View all " +  deps[i] + " Courses";
			relatedCourses.appendChild(generateSidebarLink(relatedURL, "mcen-red", relatedButtonString, false)); 
		}	
	}

	if (document.getElementsByClassName("view-catalog-program").length > 0) {

		//SIDEBAR SECTION: RELATED PROGRAMS
		const relatedPrograms = generateSidebarSection("Related Programs");
		sidebarLinksBlock.appendChild(relatedPrograms);

		const relatedProgramsList = document.getElementsByClassName("view-catalog-program")[0];
		relatedProgramsList.className += ' mcen-relatedProgramsList';
		// sidebarRelatedBlock.appendChild(document.createElement('br'));
		relatedPrograms.appendChild(relatedProgramsList);
	}

	// remove oldSidebarContainerDiv
	if (document.getElementById("sidebar-column")) {
		const oldSidebarContainerDiv = document.getElementById("sidebar-column");
		oldSidebarContainerDiv.parentNode.removeChild(oldSidebarContainerDiv); 
	}



	// insert enhanced sidebar
	document.getElementById("inner-container").appendChild(sidebar);

	sidebarTooltipsy("minervaWarning");

}


function generateSidebarSection(titleString) {
	const sidebarSection = document.createElement('div');
	sidebarSection.className = "mcen-sidebarSection";
	sidebarSection.appendChild(generateSidebarSectionTitle(titleString));
	return sidebarSection;
}


function generateSidebarSectionTitle(titleString) {
	const sidebarSectionTitle = document.createElement("h3");
	sidebarSectionTitle.className = "mcen-sidebarSectionTitle";
	sidebarSectionTitle.innerText = titleString;
	return sidebarSectionTitle;
}


function generateSidebarSectionSeparator(separatorTitleString) {
	const sidebarSectionSeparator = document.createElement('div');
	sidebarSectionSeparator.className = "mcen-sidebarSectionSeparator";
	sidebarSectionSeparator.appendChild(generateSidebarSectionSeparatorLeft());
	sidebarSectionSeparator.appendChild(generateSidebarSectionSeparatorRight(separatorTitleString));
	return sidebarSectionSeparator;
}


function generateSidebarSectionSeparatorLeft() {
	const sidebarSectionSeparatorLeftFront = document.createElement('div');
	sidebarSectionSeparatorLeftFront.className = "mcen-sidebarSectionSeparatorLeftFront";

	const sidebarSectionSeparatorLeftBack = document.createElement('div');
	sidebarSectionSeparatorLeftBack.className = "mcen-sidebarSectionSeparatorLeftBack";
	sidebarSectionSeparatorLeftBack.appendChild(sidebarSectionSeparatorLeftFront);
	return sidebarSectionSeparatorLeftBack;
}


function generateSidebarSectionSeparatorRight(separatorTitleString) {
	const sidebarSectionSeparatorRight = document.createElement('div');
	sidebarSectionSeparatorRight.className = "mcen-sidebarSectionSeparatorRight";
	sidebarSectionSeparatorRight.innerText = separatorTitleString;
	return sidebarSectionSeparatorRight;
}


function generateSidebarLink(url, colorClass, buttonValue, minervaWarning) {
	const sidebarLink = document.createElement('a');
	sidebarLink.setAttribute("href", url);
	if (minervaWarning ) {
		sidebarLink.title = "Must be already signed into Minerva!";
		sidebarLink.className = "minervaWarning";
	}
	sidebarLink.appendChild(generateSidebarLinkButton(colorClass, buttonValue, minervaWarning));
	return sidebarLink;
}


function generateSidebarLinkButton(colorClass, buttonValue, minervaWarning ) {
	const linkButton = document.createElement('button');
	linkButton.className = 'form-submit mcen-linkButton ' + colorClass;
	linkButton.innerText = buttonValue;
	return linkButton;
}


function generateSidebarBlock(titleString) {
	const sidebarRelatedBlock = document.createElement('div');
	sidebarRelatedBlock.className = "block mcen-sidebarRelatedBlock";
	sidebarRelatedBlock.appendChild(generateSidebarBlockTitle(titleString));
	return sidebarRelatedBlock;   
}


function generateSidebarBlockTitle(titleString) {
	const sidebarRelatedBlockTitle = document.createElement('h3');
	sidebarRelatedBlockTitle.className = "mcen-sidebarRelatedBlockTitle";
	sidebarRelatedBlockTitle.innerText = titleString;
	return sidebarRelatedBlockTitle;
}


function sidebarTooltipsy(className, offset) {
	if (offset === undefined) {
		// offset = [0, -16];
		offset = [0, -14];
	}
	$('.' + className).tooltipsy( {
		delay: 400,
		offset: offset,
		hide: function (e, $el) {
			$el.slideUp(50);
		},
		css: {
			fontFamily: 'CartoGothicStdBook',
			padding: '6px 12px',
			color: '#444444',
			fontSize: '.8em',
			backgroundColor: '#FFF0F0',
			borderRadius: '6px',
			boxShadow: '2px 2px 10px #E54944'
		}
	});
}


function getVSBSemesters(vsbSidebarTerms) {
    const xmlRequestInfo = {
        method: 'GET',
        action: 'xhttp',
        url: 'https://vsb.mcgill.ca/vsb'
    };
    chrome.runtime.sendMessage(xmlRequestInfo, generateGetVSBSemestersCallback(vsbSidebarTerms));
}


function generateGetVSBSemestersCallback(vsbSidebarTerms) {
	return function(data) {
		const htmlParser = new DOMParser();
		const htmlDoc = htmlParser.parseFromString(data.responseXML, 'text/html');

		const vsbAvailableTerms = [];
		vsbTermButtons = htmlDoc.getElementsByClassName('termRadio');
		for (let t = 0; t < vsbTermButtons.length; t++) {
			vsbAvailableTerms.push(vsbTermButtons[t].getAttribute('data-term'));
		}

		logForDebug(vsbSidebarTerms);
		logForDebug(vsbAvailableTerms);

		if (vsbAvailableTerms.length > 0) {
			for (let t = 0; t < vsbSidebarTerms.length; t++) {
				const termCode = vsbSidebarTerms[t];
				if (vsbAvailableTerms.indexOf(termCode) === -1) {
					logForDebug(" Disable " + termCode);
					disableVSBSidebarTerm(termCode);
				}
			}
			sidebarTooltipsy("vsbTermNotAvailable");
		}
	};
}


function disableVSBSidebarTerm(termCode) {
	const vsbSidebarButton = document.getElementsByClassName('mcen-vsb' + termCode)[0];
	vsbSidebarButton.className = 'form-submit mcen-linkButton not-active';
	vsbSidebarButton.parentElement.href = 'https://vsb.mcgill.ca/vsb';
	vsbSidebarButton.parentElement.className = 'vsbTermNotAvailable';
	if (termCode < sysCode) {
		vsbSidebarButton.parentElement.title = 'This term is no longer available in VSB!';
	}
	else {
		vsbSidebarButton.parentElement.title = 'This term is not yet available in VSB!';
	}
}