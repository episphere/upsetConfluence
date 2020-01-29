console.log('epiUpSet.js loaded')

// style //
document.body.style.backgroundColor="gray"

// Box file call //
/*
x = await (await fetch('https://api.box.com/2.0/files/558252350024/content',{
	headers: {
		Authorization: `Bearer ${JSON.parse(localStorage.parms).access_token}`
}
})).json()
*/

epiUpSet=function(){
	// ini
	console.log(`epiUpSet fun at ${Date()}`)
}

epiUpSet.saveFile=function(x,fileName) { // x is the content of the file
	// var bb = new Blob([x], {type: 'application/octet-binary'});
	// see also https://github.com/eligrey/FileSaver.js
	var bb = new Blob([x]);
   	var url = URL.createObjectURL(bb);
	var a = document.createElement('a');
   	a.href=url;
	if (fileName){
		if(typeof(fileName)=="string"){ // otherwise this is just a boolean toggle or something of the sort
			a.download=fileName;
		}
		a.click() // then download it automatically 
	} 
	return a
}

epiUpSet.box2upset=async(id=558252350024,
    parms={
    	id:['BCAC_ID'],
    	dumb:['status','ethnicityClass','famHist','study','ER_statusIndex','ageInt']
    })=>{
	var x = await (await fetch(`https://api.box.com/2.0/files/${id}/content`,{
		headers: {
			Authorization: `Bearer ${JSON.parse(localStorage.epiBoxToken).access_token}`
	}})).json()
	console.log(`loaded ${x.length} rows x ${Object.keys(x[0]).length} columns`)
	epiUpSet.dt=x
	epiUpSet.tab={} // tabular data
	epiUpSet.uni={}
	var xx=Array(x.length)
	Object.keys(x[0]).forEach(k=>{
		epiUpSet.tab[k]=[...Array(x.length)].map(_=>[])
		epiUpSet.tab[k]=epiUpSet.tab[k].map((_,i)=>{
			return x[i][k]
		})
		if(parms.dumb.indexOf(k)!=-1){
			epiUpSet.uni[k]=[...new Set(epiUpSet.tab[k])]
		}
		// tabulate values
		//debugger
	})
	// assemble the data https://github.com/VCG/upset/wiki
	let filejson={
		file:'http://localhost:8000/upset/data/confluence/epiUpSet.csv',
		name:'epiUpSet Confluence',
		header: 0,
		separator: ';',
		skip:0,
		meta:[
		    { "type": "id", "index": 0, "name": "BCAC_ID" }
		],
		sets:[
		    { "format": "binary", "start": 1, "end": 10 }
		],
		author:'Bhaumik and Jonas',
		description:'example of upset plot with confluence data',
		source:'https://episphere.github.io/confluence'
	}



	
	// header
	// reference ids
	let hh = parms.id
	parms.dumb.forEach(k=>{
		epiUpSet.uni[k].forEach(kk=>{
			hh.push(k+' # '+kk)
		})
	})

	// update config file

	epiUpSet.saveFile(JSON.stringify(filejson,null,3),'epiUpSet.json')
	let filecsv=hh.join(filejson.separator)
	let rr=x.map(xi=>{
		let r = [...Array(hh.length)].map(_=>0)
		hh.forEach((h,i)=>{
			if(!h.match(' # ')){
				r[i]=xi[h]
			}else{
				let ii=h.split(' # ')
				if(xi[ii[0]]==ii[1]){
					r[i]=1
				}
				//debugger
			}
		})
		filecsv+='\n'+r.join(filejson.separator)
		return r
	})

	epiUpSet.saveFile(filecsv,'epiUpSet.csv')




	/*
	{
		"file": "data/movies/movies.csv",
		"name": "Movies Genres",
		"header": 0,
		"separator": ";",
		"skip": 0,
		"meta": [
			{ "type": "id", "index": 0, "name": "Name" },
			{ "type": "integer", "index": 1, "name": "Release Date" },
			{ "type": "float", "index": 19, "name": "Average Rating", "min": 1, "max": 5 },
			{ "type": "integer", "index": 20, "name": "Times Watched" }
		],
		"sets": [
			{ "format": "binary", "start": 2, "end": 18 }
		],
		"author": "grouplens",
		"description": "MovieLens ratings dataset, curated and filtered by Alsallakh.",
		"source": "http://grouplens.org/datasets/movielens/"
	}
	*/

	//debugger
	// extract parms
	return x
}

epiUpSet()