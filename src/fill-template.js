import {
	buildToc,
	buildTOMTitleLink,
	buildNav,
	buildSecMenu,
	buildBreadcrumbs,
} from './build-components';

export default function fillTemplate(docObj, wet4path) {
	const toc = buildToc(docObj.toc, docObj.metadata.language);
	const tomTitleLink = buildTOMTitleLink(docObj.breadcrumbs);
	const nav = buildNav(docObj.nav, docObj.metadata.language, docObj.tomNumber);
	const secMenu = buildSecMenu(docObj.secMenu, docObj.metadata.language, tomTitleLink, docObj.metadata.isHomepage);
	const breadcrumbs = buildBreadcrumbs(docObj.breadcrumbs, docObj.pageTitle, docObj.metadata.isHomepage);

	if (docObj.metadata.language === 'eng') {
		return `<!-- InstanceBegin template="file:///N|/irppd/manuals/Templates/wet40-manuals_secure-en.dwt" codeOutsideHTMLIsLocked="false" -->
<!DOCTYPE html>
<!--[if lt IE 9]><html class="no-js lt-ie9" lang="en" dir="ltr"><![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="en" dir="ltr">
<!--<![endif]-->
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<!-- Web Experience Toolkit (WET4.0.12) / Bo�te � outils de l'exp�rience Web (BOEW4.0.12)
wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html -->
<!-- InstanceBeginEditable name="doctitle" -->
<title>${docObj.title}</title>
<!-- InstanceEndEditable -->
<meta content="width=device-width,initial-scale=1" name="viewport">
	<!-- InstanceBeginEditable name="metadata" -->
	<meta name="dcterms.title" content="${docObj.metadata.title}" /> 
	<meta name="ManualHomePage" content="${docObj.metadata.isHomepage}" />  
	<meta name="ManualID" content="${docObj.metadata.manualId}" />
	<meta name="ManualName" content="${docObj.metadata.manualName}" />
	<meta name="ManualGroupID" content="" />
	<meta name="ManualGroupName" content="" />
	<meta name="dc.description" content="${docObj.metadata.description}" />
	<meta name="description" content="${docObj.metadata.description}" /> 
	<meta name="dc.subject" title="CRAintranet" content="" /> 
	<meta name="keywords" content="${docObj.metadata.keywords}" />
	<meta name="dc.creator" content="${docObj.metadata.creator}" />
	<meta name="owner" content="${docObj.metadata.owner}" /> 
	<meta name="dc.publisher" content="${docObj.metadata.publisher}" />
	<meta name="dc.language" title="ISO639-2" content="eng" />
	<meta name="dcterms.issued" title="W3CDTF" content="${docObj.metadata.issued}" /> 
	<meta name="dcterms.modified" title="W3CDTF" content="${docObj.metadata.modified}" /> 
	<meta name="dcterms.audience" title="CRAaudience" content="" /> 
	<meta name="dc.type" title="gctype" content="guide" /> 
	<meta name="dcterms.spatial" title="CRAgeonames" content="" /> 
	<meta name="robots" content="index,follow" /> 
	<meta name="dc.identifier" content="" />
	<meta name="metaQA" content="" />
	<!-- InstanceEndEditable -->
<!--[if gte IE 9 | !IE ]><!-->
<link href="http://infozone/wet40/assets/favicon.ico" rel="icon" type="image/x-icon" />
<link rel="stylesheet" href="${wet4path}/css/wet-boew.min.css" />
<!--<![endif]-->
<link rel="stylesheet" href="${wet4path}/css/theme.min.css" />
<!--[if lt IE 9]>
<link href="http://infozone/wet40/assets/favicon.ico" rel="shortcut icon" />
<link rel="stylesheet" href="${wet4path}/css/ie8-wet-boew.min.css" />
<link rel="stylesheet" href="${wet4path}/intranet/css/custom.css" />
<link rel="stylesheet" href="${wet4path}/fa/css/fa.css" />
<script src="${wet4path}/js/ie8-jquery.js"></script>
<script src="${wet4path}/js/ie8-wet-boew.min.js"></script>
<![endif]-->
<noscript>
<link rel="stylesheet" href="${wet4path}/css/noscript.min.css" />
</noscript>
<link rel="stylesheet" href="${wet4path}/intranet/css/custom.css" />
<link rel="stylesheet" href="${wet4path}/fa/css/fa.css" />
<!-- InstanceBeginEditable name="css" -->
<!-- InstanceEndEditable -->
</head>
<body vocab="http://schema.org/" typeof="WebPage">
<ul id="wb-tphp">
	<li class="wb-slc"> <a class="wb-sl" href="#wb-cont">Skip to main content</a></li>
	<li class="wb-slc visible-sm visible-md visible-lg"> <a class="wb-sl" href="#wb-info">Skip to "About this site"</a></li>
</ul>
<header role="banner">
	<div id="wb-bnr">
		<div id="wb-bar">
			<div class="container">
				<div class="row"> <img id="gcwu-sig" tabindex="-1" src="${wet4path}/assets/sig-en.png" alt="Canada Revenue Agency" />
					<section id="wb-lng">
						<h2>Language selection</h2>
						<ul class="list-inline">
							<!-- InstanceBeginEditable name="language" -->			
							<li><a lang="fr" href="${docObj.langFilename}">Français</a></li>
							<!-- InstanceEndEditable -->
						</ul>
					</section>
					<section class="wb-mb-links col-xs-12 visible-sm visible-xs" id="wb-glb-mn">
						<h2>Search and menus</h2>
						<ul class="pnl-btn list-inline text-right">
							<li><a href="#mb-pnl" title="Search and menus" aria-controls="mb-pnl" class="overlay-lnk btn btn-sm btn-default"><span class="glyphicon glyphicon-search"><span class="glyphicon glyphicon-th-list"><span class="wb-inv">Search and menus</span></span></span></a></li>
						</ul>
						<div id="mb-pnl"></div>
					</section>
				</div>
			</div>
		</div>
		<div class="container">
			<div class="row">
				<div id="wb-sttl" class="col-md-12">
					<a href="http://infozone/english/frames/main/menu-e.asp"> <span>InfoZone</span></a>
					<img id="wmms" tabindex="-1" src="${wet4path}/assets/wmms-intra.png" alt="Symbol of Government of Canada"/>
				</div>
				<section id="wb-srch" class="visible-md visible-lg">
					<h2>Search</h2>
				</section>
			</div>
		</div>
	</div> 
	<nav role="navigation" id="wb-bc" property="breadcrumb">
		<h2>You are here:</h2>
		<div class="container">
			<div class="row">
				<ol class="breadcrumb">
					<!-- InstanceBeginEditable name="breadcrumbs" -->	
					<li><a href="http://infozone/english/frames/main/menu-e.asp">Home</a></li>
					<li><a href="http://infozone/english/r5060502/abs/default-e.html">Assessment, Benefit, and Service Branch</a></li>
					<li><a href="https://apps.isvcs.net/ebci/cjsc/sfsmnl/main?lang=en&nextPage=viewManualList">Secure Manuals</a></li>
${breadcrumbs}
					<!-- InstanceEndEditable -->  
				</ol>
			</div>
		</div> 
	</nav>
	<div id="wb-bnr-ss-alt" class="container">
		<div class="pull-right mrgn-lft-lg">
			<p><a href="https://apps.isvcs.net/ebci/cjsc/sfsmnl/main?lang=en" class="btn btn-default"><span class="glyphicon glyphicon-search"></span> Secure Search</a></p>
		</div>
		<div class="clearfix visible-xs visible-sm"></div>
		<!-- InstanceBeginEditable name="TOM Title" -->	
		<div id="wb-ss" class="mrgn-tp-0 clearfix">${tomTitleLink}</div>
		<!-- InstanceEndEditable -->  
	</div>
	<div class="clearfix"></div>
	<span data-trgt="mb-pnl" class="wb-menu hide"></span>
</header>
<main role="main" property="mainContentOfPage" class="container">
<div class="clearfix mrgn-bttm-lg"></div>
<!-- InstanceBeginEditable name="Title" -->
<h1 id="wb-cont" property="name" class="page-header${docObj.metadata.isHomepage ? ' wb-inv' : ''}">${docObj.pageTitle}</h1>
<!-- InstanceEndEditable -->

<!-- InstanceBeginEditable name="navigation-top" -->
${nav}
<!-- InstanceEndEditable -->

<!-- InstanceBeginEditable name="Section menu" -->
${secMenu}
<!-- InstanceEndEditable -->

<!-- InstanceBeginEditable name="Table of Contents" -->
${toc}
<!-- InstanceEndEditable -->

<!-- Searchable content begins / debut de la recherche du contenu -->
<!-- InstanceBeginEditable name="content" -->

${docObj.content}

<!-- InstanceEndEditable -->
<!-- Searchable content ends / fin de la recherche du contenu -->
<div class="mrgn-bttm-xl clearfix"></div>

<!-- InstanceBeginEditable name="navigation-bottom" -->
${nav}
<!-- InstanceEndEditable -->

<div class="pull-left">
	<p><a class="btn btn-default" href="mailto:SEMP-PMES@cra-arc.gc.ca" ><span class="glyphicon glyphicon-comment"></span> Feedback about this manual</a></p>
</div>
	<dl id="wb-dtmd" class="mrgn-tp-0">
		<dt>Last updated:&#32;</dt>
		<dd>
			<!-- InstanceBeginEditable name="date" -->
			<time property="dateModified">${docObj.metadata.modified}</time>
			<!-- InstanceEndEditable -->	
		</dd>
	</dl>
	<div class="clearfix"></div>
</main>
<footer role="contentinfo" id="wb-info" class="visible-sm visible-md visible-lg wb-navcurr">
	<div class="container">
		<nav role="navigation">
			<h2>Site information</h2>
			<section>
				<h3 class="hidden-sm hidden-md hidden-lg">Government of Canada links</h3>
				<ul class="list-inline mrgn-bttm-lg pull-right">
					<li><a href="\\\\omega.dce-eir.net\\natdfs\\Services\\Central_storage\\ABSB_Secure_Files\\IND\\user_guide\\guide-e.html">User guide for online manuals</a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://www.cra-arc.gc.ca/menu-eng.html" rel="external"><abbr title="Canada Revenue Agency" rel="external">CRA</abbr> internet</a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://canada.ca/en/index.html" rel="external">Canada.ca</a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://publiservice.gc.ca/menu_e.html" rel="external">Publiservice</a></li>
				</ul>
			</section>
			<ul id="gc-tctr" class="list-inline pull-left">
				<li><a href="http://infozone/english/gbl/util/ntcs-eng.html">Terms and conditions</a></li>
			</ul>
		</nav>
	</div>
</footer>
<!--[if gte IE 9 | !IE ]><!-->
<script src="${wet4path}/js/jquery.js"></script>
<script src="${wet4path}/js/wet-boew.min.js"></script>
<!--<![endif]-->
<!--[if lt IE 9]>
<script src="${wet4path}/js/ie8-wet-boew2.min.js"></script>
<![endif]-->
<script src="${wet4path}/js/theme.min.js"></script>
<!-- InstanceBeginEditable name="js" -->
<!-- InstanceEndEditable -->
</body>
<!-- InstanceEnd -->
</html>`;
	} else if (docObj.metadata.language === 'fra') {
		return `<!-- InstanceBegin template="/Templates/wet40-manuals_secure-fr.dwt" codeOutsideHTMLIsLocked="false" -->
<!DOCTYPE html>
<!--[if lt IE 9]><html class="no-js lt-ie9" lang="fr" dir="ltr"><![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="fr" dir="ltr">
<!--<![endif]-->
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<!-- Web Experience Toolkit (WET4.0.12) / Bo�te � outils de l'expérience Web (BOEW4.0.12)
wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html -->
<!-- InstanceBeginEditable name="doctitle" -->
<title>${docObj.title}</title>
<!-- InstanceEndEditable -->
<meta content="width=device-width,initial-scale=1" name="viewport">
	<!-- InstanceBeginEditable name="metadata" -->
	<meta name="dcterms.title" content="${docObj.metadata.title}" /> 
	<meta name="ManualHomePage" content="${docObj.metadata.isHomepage}" />  
	<meta name="ManualID" content="${docObj.metadata.manualId}" />
	<meta name="ManualName" content="${docObj.metadata.manualName}" />
	<meta name="ManualGroupID" content="" />
	<meta name="ManualGroupName" content="" />
	<meta name="dc.description" content="${docObj.metadata.description}" />
	<meta name="description" content="${docObj.metadata.description}" /> 
	<meta name="dc.subject" title="CRAintranet" content="" /> 
	<meta name="keywords" content="${docObj.metadata.keywords}" />
	<meta name="dc.creator" content="${docObj.metadata.creator}" />
	<meta name="owner" content="${docObj.metadata.owner}" /> 
	<meta name="dc.publisher" content="${docObj.metadata.publisher}" />
	<meta name="dc.language" title="ISO639-2" content="eng" />
	<meta name="dcterms.issued" title="W3CDTF" content="${docObj.metadata.issued}" /> 
	<meta name="dcterms.modified" title="W3CDTF" content="${docObj.metadata.modified}" /> 
	<meta name="dcterms.audience" title="CRAaudience" content="" /> 
	<meta name="dc.type" title="gctype" content="guide" /> 
	<meta name="dcterms.spatial" title="CRAgeonames" content="" /> 
	<meta name="robots" content="index,follow" /> 
	<meta name="dc.identifier" content="" />
	<meta name="metaQA" content="" />
	<!-- InstanceEndEditable -->	
<!--[if gte IE 9 | !IE ]><!-->
<link href="http://infozone/wet40/assets/favicon.ico" rel="icon" type="image/x-icon" />
<link rel="stylesheet" href="${wet4path}/css/wet-boew.min.css" />
<!--<![endif]-->
<link rel="stylesheet" href="${wet4path}/css/theme.min.css" />
<!--[if lt IE 9]>
<link href="http://infozone/wet40/assets/favicon.ico" rel="shortcut icon" />
<link rel="stylesheet" href="${wet4path}/css/ie8-wet-boew.min.css" />
<link rel="stylesheet" href="${wet4path}/intranet/css/custom.css" />
<link rel="stylesheet" href="${wet4path}/fa/css/fa.css" />
<script src="${wet4path}/js/ie8-jquery.js"></script>
<script src="${wet4path}/js/ie8-wet-boew.min.js"></script>
<![endif]-->
<noscript>
<link rel="stylesheet" href="${wet4path}/css/noscript.min.css" />
</noscript>
<link rel="stylesheet" href="${wet4path}/intranet/css/custom.css" />
<link rel="stylesheet" href="${wet4path}/fa/css/fa.css" />
<!-- InstanceBeginEditable name="css" -->
<!-- InstanceEndEditable -->
</head>
<body vocab="http://schema.org/" typeof="WebPage">
<ul id="wb-tphp">
	<li class="wb-slc"> <a class="wb-sl" href="#wb-cont">Passer au contenu principal</a> </li>
	<li class="wb-slc visible-sm visible-md visible-lg"> <a class="wb-sl" href="#wb-info">Passer à &#171;&#160;&#192; propos de ce site&#160;&#187;</a> </li>
</ul>
<header role="banner">
	<div id="wb-bnr">
		<div id="wb-bar">
			<div class="container">
				<div class="row"><img id="gcwu-sig" tabindex="-1" src="${wet4path}/assets/sig-fr.png" alt="Agence du revenu du Canada"/>
					<section id="wb-lng">
						<h2>Sélection de la langue</h2>
						<ul class="list-inline">
							<!-- InstanceBeginEditable name="Lien anglais" -->
							<li><a lang="en" href="${docObj.langFilename}">English</a></li>
							<!-- InstanceEndEditable -->  
						</ul>
					</section>
					<section class="wb-mb-links col-xs-12 visible-sm visible-xs" id="wb-glb-mn">
						<h2>Recherche et menus</h2>
						<ul class="pnl-btn list-inline text-right">
							<li><a href="#mb-pnl" title="Recherche et menus" aria-controls="mb-pnl" class="overlay-lnk btn btn-sm btn-default" role="button"><span class="glyphicon glyphicon-search"><span class="glyphicon glyphicon-th-list"><span class="wb-inv">Recherche et menus</span></span></span></a></li>
						</ul>
						<div id="mb-pnl"></div>
					</section>
				</div>
			</div>
		</div>
		<div class="container">
			<div class="row">
				<div id="wb-sttl" class="col-md-12">
					<a href="http://infozone/francais/frames/main/menu-f.asp"><span>InfoZone</span></a>
					<img id="wmms" tabindex="-1" src="${wet4path}/assets/wmms-intra.png" alt="Symbole du Gouvernement du Canada"/>
				</div>
				<section id="wb-srch" class="visible-md visible-lg">
					<h2>Recherche</h2>
				</section>
			</div>
		</div>
	</div>
	<nav role="navigation" id="wb-bc" property="breadcrumb">
		<h2>Vous êtes ici :</h2>
		<div class="container">
			<div class="row">
				<ol class="breadcrumb">
					<!-- InstanceBeginEditable name="breadcrumbs" -->
					<li><a href="http://infozone/francais/frames/main/menu-f.asp">Accueil</a></li>
					<li><a href="http://infozone/francais/francais/r5060502/abs/default-f.html">Direction générale de cotisation, de prestation et de service</a></li>
					<li><a href="https://apps.isvcs.net/ebci/cjsc/sfsmnl/main?lang=fr&#38;nextPage=viewManualList">Manuels sécurisés</a></li>
${breadcrumbs}
					<!-- InstanceEndEditable -->
				</ol>
			</div>
		</div>
	</nav>
	<div id="wb-bnr-ss-alt" class="container">
		<div class="pull-right mrgn-lft-lg">
			<p><a href="https://apps.isvcs.net/ebci/cjsc/sfsmnl/main?lang=fr" class="btn btn-default"><span class="glyphicon glyphicon-search"></span> Recherche sécurisée</a></p>
		</div>
		<div class="clearfix visible-xs visible-sm"></div>
	<!-- InstanceBeginEditable name="TOM Title" -->	
		<div id="wb-ss" class="mrgn-tp-0 clearfix">${tomTitleLink}</div>
	<!-- InstanceEndEditable -->  
	</div>
	<div class="clearfix"></div>
	<span data-trgt="mb-pnl" class="wb-menu hide"></span>
</header>
<main role="main" property="mainContentOfPage" class="container">
<div class="clearfix mrgn-bttm-lg"></div>

<!-- InstanceBeginEditable name="Titre" -->
<h1 id="wb-cont" property="name" class="page-header${docObj.metadata.isHomepage ? ' wb-inv' : ''}">${docObj.pageTitle}</h1>
<!-- InstanceEndEditable -->	

<!-- InstanceBeginEditable name="navigation-top" -->
${nav}
<!-- InstanceEndEditable -->

<!-- InstanceBeginEditable name="Menu de section" -->
${secMenu}
<!-- InstanceEndEditable -->

<!-- InstanceBeginEditable name="Table des matières" -->
${toc}
<!-- InstanceEndEditable -->	

<!-- Searchable content begins / debut de la recherche du contenu -->
<!-- InstanceBeginEditable name="content" -->

${docObj.content}

<!-- InstanceEndEditable --> 
<!-- Searchable content ends / fin de la recherche du contenu -->
<div class="mrgn-bttm-xl clearfix"></div>

<!-- InstanceBeginEditable name="navigation-bottom" -->
${nav}
<!-- InstanceEndEditable -->

<div class="pull-left">
	<p><a class="btn btn-default" href="mailto:SEMP-PMES@cra-arc.gc.ca" ><span class="glyphicon glyphicon-comment"></span> Rétroaction à l'équipe des Manuels sécurisés</a></p>
</div>		
<dl id="wb-dtmd" class="mrgn-tp-0">
	<dt>Dernière mise à jour&#160;:&#32;</dt>
	<dd>
		<!-- InstanceBeginEditable name="date" -->
		<time property="dateModified">${docObj.metadata.modified}</time>
		<!-- InstanceEndEditable -->  
	</dd>
</dl>
<div class="clearfix"></div>
</main>
<footer role="contentinfo" id="wb-info" class="visible-sm visible-md visible-lg wb-navcurr">
	<div class="container">
		<nav role="navigation">
			<h2>&#192; propos de ce site</h2>
			<section>
				<h3 class="hidden-sm hidden-md hidden-lg">Liens du gouvernement du Canada</h3>
				<ul class="list-inline mrgn-bttm-lg pull-right">
					<li><a href="\\\\omega.dce-eir.net\\natdfs\\Services\\Central_storage\\ABSB_Secure_Files\\IND\\user_guide\\guide-f.html">Guide pour les utilisateurs de manuels en ligne </a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://www.cra-arc.gc.ca/menu-fra.html" rel="external">Internet de l'<abbr title="Agence du revenu du Canada">ARC</abbr></a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://canada.ca/fr/index.html" rel="external">Canada.ca</a></li>
					<li class="mrgn-tp-md mrgn-lft-xl"><a href="http://publiservice.gc.ca/menu_f.html" rel="external">Publiservice</a></li>
				</ul>
			</section>
			<ul id="gc-tctr" class="list-inline pull-left">
				<li><a href="http://infozone/francais/gbl/util/ntcs-fra.html">Avis</a></li>
			</ul>
		</nav>
	</div>
</footer>
<!--[if gte IE 9 | !IE ]><!-->
<script src="${wet4path}/js/jquery.js"></script>
<script src="${wet4path}/js/wet-boew.min.js"></script>
<!--<![endif]-->
<!--[if lt IE 9]>
<script src="${wet4path}/js/ie8-wet-boew2.min.js"></script>
<![endif]-->
<script src="${wet4path}/js/theme.min.js"></script>
<!-- InstanceBeginEditable name="js" -->
<!-- InstanceEndEditable -->
</body>
<!-- InstanceEnd -->
</html>`;
	}
}