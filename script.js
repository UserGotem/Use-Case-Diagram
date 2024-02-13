const pwd = 1933289284;
let uve = 3, aanestykset = [], avaaAanestys = -1;
function kirjaudu_sisään(event) {
    event.preventDefault();
    const id = event.target.querySelector('input#tunnus');
    const password = event.target.querySelector('input#salasana');

    if (id.value == 'admin' && hash(password.value) == pwd) {
        id.value = '';
        password.value = '';
        id.classList.remove('is-invalid');
        password.classList.remove('is-invalid');
        document.querySelector('#adminbutton').click();
        vaihdaKayttaja('admin');
        document.querySelector('#buttonluouusi').removeAttribute('disabled');
        document.querySelector('#ohje').setAttribute('hidden','true');
    } else {
        id.classList.add('is-invalid');
        password.classList.add('is-invalid');
    }
}

function vaihdaKayttaja(ktj) {
    const toinen = (ktj == 'admin') ? 'user' : 'admin';

    document.querySelectorAll('.'+toinen).forEach(itm => {
        itm.style.display = 'none';
    });
    document.querySelectorAll('.'+ktj).forEach(itm => {
        itm.style.display = 'block';
    });

}
/*code to 6numbers*/
function hash(s) {/*salasanan merkityksella */
    let h = 0, i, chr;
    if (s.length == 0) return h;
    for (i=0;i<s.length;i++) {
        chr = s.charCodeAt(i);
        h = ((h << 5) - h) + chr; /*code to 6numbers*/
        h |= 0; // 32bit integer
    }
    return h;
}

function atr() { // [0]: remove/set, [1]: attribute, [2+]: element(s)
    switch (arguments[0][0]) {
        case 's':
            // set
            for (let i=2; i<arguments.length; i++) {
                document.querySelector(arguments[i]).setAttribute(arguments[1],'true');
            }
            break;
        case 'r':
            // remove
            for (let i=2; i<arguments.length; i++) {
                document.querySelector(arguments[i]).removeAttribute(arguments[1]);
            }
            break;
    }
}

function kirjautua_pois() {
    document.querySelector('#adminbutton').click();
    atr('s','hidden','#divluouusi','#ohje');
    vaihdaKayttaja('user');
    listaaAanestykset(false,-1);    
}

function newCreateone() {
    atr('r','hidden','#divluouusi')
    atr('s','disabled','#buttonluouusi','#buttonpoista','#adminbutton');
    atr('s','hidden','#ohje','#divaanestykset');
    document.querySelector('#playground #otsikko').focus();
}

function addNewOption() {
    const ve = document.querySelector('#viimeinenvaihtoehto');
    // poistetaan nykyisestä vaihtoehdosta id
    ve.removeAttribute('id');
    // nappulat piiloon
    ve.querySelectorAll('button').forEach((ele) => {
        ele.setAttribute('hidden','true');
    })
    
    // kloonataan templatesta uusi vaihtoehto
    let klooni = document.querySelector('#uusivaihtoehto').content.cloneNode(true);
    klooni.querySelector('#vaihtoehtoteksti').innerText = 'Vaihtoehto ' + uve++;
    klooni.querySelector('#vaihtoehtoteksti').removeAttribute('id');
    ve.after(klooni);

    document.querySelector('#viimeinenvaihtoehto input').focus();
}

function peruutaAanestys() { // peruutetaan uuden äänestyksen luominen
    document.querySelector('#otsikko').value = '';
    document.querySelectorAll('#vaihtoehdot input').forEach((v) => {v.value = ''});

    while (uve > 3) {
        let tama = document.querySelector('#viimeinenvaihtoehto');
        let edel = tama.previousElementSibling;
        edel.setAttribute('id','viimeinenvaihtoehto');
        edel.querySelectorAll('button').forEach((ele) => {
            if (ele.hasAttribute('hidden')) ele.removeAttribute('hidden');
        });
        tama.remove();
        uve -= 1;
    }
    atr('s','hidden','#divluouusi');
    atr('r','disabled','#buttonluouusi','#adminbutton');
    atr('r','hidden','#divaanestykset');
    listaaAanestykset(false,-1);

}

function uusiAanestysValmis() {
    let invcount = 0;
    // tarkistetaan että otsikossa lukee jotain
    const ot = document.querySelector('#otsikko');
    if (!ot.value || ot.value.trim().length == 0) {
        ot.classList.add('is-invalid');
        invcount += 1;
    } else if (ot.classList.contains('is-invalid')) ot.classList.remove('is-invalid');
    // tarkastetaan että kaikiin vaihtoehtoihin on syötetty jotain ja vaihtoehdot eroavat toisistaan
    const ve = document.querySelectorAll('#vaihtoehdot input');
    let veh = [];
    ve.forEach((itm) => {
        if (!itm.value || itm.value.trim().length == 0 || veh.includes(itm.value.trim())) {
            itm.classList.add('is-invalid');
            invcount += 1;
        } else if (itm.classList.contains('is-invalid')) itm.classList.remove('is-invalid');
        veh.push(itm.value.trim());
    });

    if (invcount == 0) {
        // Lisää uusi kysely
        let k = {
            nimi: ot.value.trim(),
            ve: []
        }
        // poistetaan kenttien arvot
        ot.value = '';
        ve.forEach((itm) => {
            let vaeh = {
                nimi: itm.value.trim(),
                aanet: 0
            }
            k.ve.push(vaeh);
            itm.value = '';
        });
        aanestykset.push(k);
       
        while (uve > 3) {
            let tama = document.querySelector('#viimeinenvaihtoehto');
            let edel = tama.previousElementSibling;
            edel.setAttribute('id','viimeinenvaihtoehto');
            edel.querySelectorAll('button').forEach((ele) => {
                if (ele.hasAttribute('hidden')) ele.removeAttribute('hidden');
            });
            tama.remove();
            uve -= 1;
        }
        
        atr('s','hidden','#divluouusi');
        atr('r','disabled','#buttonluouusi','#buttonpoista','#adminbutton');
        atr('r','hidden','#divaanestykset');
        avaaAanestys = aanestykset.length-1;
        tallennaAanestykset();
        listaaAanestykset(false,-1);
    }

}
function haeAanestykset() {
    if (localStorage.getItem('aanestykset') != null ) {
        aanestykset = JSON.parse(window.localStorage.getItem('aanestykset'));
    }
}

function tallennaAanestykset() {
    if (aanestykset.length > 0) {
        window.localStorage.setItem('aanestykset',JSON.stringify(aanestykset));
    } else if (localStorage.getItem('aanestykset') != null) {
        localStorage.removeItem('aanestykset');
    }
}

function poistaVaihtoehto(srcele) {
    // nappulan vanhempi ja sitä edeltävä sisarus
    const src = srcele.parentElement, prev = srcele.parentElement.previousElementSibling;
    // poistetaan vanhempi
    src.remove();
    // edeltävään sisarukseen id='viimeinenvaihtoehto'
    prev.setAttribute('id','viimeinenvaihtoehto');
    // edellisen sisaruksen napit näkyviin
    prev.querySelectorAll('button').forEach((ele) => {
        if (ele.hasAttribute('hidden')) ele.removeAttribute('hidden');
    });
    // vähennetään seuraavan uuden vaihtoehdon numeroa yhdellä
    uve -= 1;
    prev.querySelector('input').focus();
    
}

function listaaAanestykset(poisto, aanesta) {
    const dst = document.querySelector('#divaanestykset');

    while (dst.hasChildNodes()) {
        dst.removeChild(dst.firstChild);
    }

    haeAanestykset();

    if (aanestykset.length > 0) {
        // Käydään läpi kaikki äänestykset
        aanestykset.forEach((itm, ndx) => { 
            let klooni = document.querySelector('template#aanestys').content.cloneNode(true);
            const header = klooni.querySelector('#aheader');
            header.innerText = itm.nimi;
            header.setAttribute('data-bs-target','#clps'+ndx);
            header.removeAttribute('id');
            
            if (poisto) { klooni.querySelector('#cb1').classList.add('show'); }
            else if (ndx == aanesta) klooni.querySelector('#cb1').classList.add('show');

            if (avaaAanestys == ndx) {
                klooni.querySelector('#cb1').classList.add('show');
                avaaAanestys = -1;
            }
            
            klooni.querySelector('#cb1').setAttribute('id','clps'+ndx);
            
            const cardbody = klooni.querySelector('#abody');

            let kaikkiaanet = 0; /*tosta laskettu kaikki äänet*/
            itm.ve.forEach((va) => { kaikkiaanet += va.aanet; });

            if (ndx != aanesta) {
                // Näytetään vaihtoehdot
                itm.ve.forEach((va) => { // Käydään läpi äänestyksen kaikki vaihtoehdot
                    let pros = (kaikkiaanet != 0 && va.aanet != 0) ? Math.round(va.aanet / kaikkiaanet * 100) : 0;
                    let htmlkoodi = '<div class="row align-items-baseline my-2"><div class="col palkki" style="background-size: '+pros+'% 2px;"><h6>'+va.nimi+'</h6></div><div class="col-auto"><h6 class="mb-0">'+va.aanet+' ('+pros+'%)</h6></div></div>';
                    cardbody.insertAdjacentHTML('beforeend', htmlkoodi);
                });
    
                let lisa = (kaikkiaanet == 0) ? '<div class="col text-end"><h6>Ei vielä ääniä</h6></div>' : '<div class="col text-end"><h6>Ääniä yhteensä: '+kaikkiaanet+'</h6></div>';

                // Nappula: Äänestä tai poista äänestys
                if (poisto) {
                    htmlkoodi = '<div class="row align-items-center"><div class="col"><button type="button" class="btn btn-danger btn-sm mb-2 float-start" onclick="varmistaPoisto('+ndx+')">Poista tämä äänestys</button></div>'+lisa+'</div>';
                    cardbody.insertAdjacentHTML('beforeend', htmlkoodi);
                    document.querySelector('#ohje').removeAttribute('hidden');
                } else {
                    htmlkoodi = '<div class="row align-items-center"><div class="col"><button type="button" class="btn btn-primary btn-sm mb-2 float-start" onclick="listaaAanestykset(false,'+ndx+')">Äänestä</button></div>'+lisa+'</div>';
                    cardbody.insertAdjacentHTML('beforeend', htmlkoodi);
                    document.querySelector('#buttonpoista').removeAttribute('disabled');
                }
    
            } else {
                // äänestä
                
                let formi = document.createElement('form');
                formi.setAttribute('onsubmit','aanestaSubmit(event)');
                formi.setAttribute('id',ndx);

                formi.insertAdjacentHTML('beforeend', '<div class="row my-1><div class="col"><h6>Valitse haluamasi vaihtoehto:</h6></div></div>')

                itm.ve.forEach((va,indx) => { // luodaan radio button kaikille vaihtoehdoille
                    formi.insertAdjacentHTML('beforeend', '<div class="row my-1"><div class="col"><input type="radio" class="me-2" id="ve'+indx+'" name="aanestys'+ndx+'" value="'+indx+'"><label for="ve'+indx+'"><h6>'+va.nimi+'</h6></label></div></div>');
                });

                formi.insertAdjacentHTML('beforeend','<input class="btn btn-primary btn-sm float-start mb-3" type="submit" value="Äänestä"><button type="button" class="btn btn-primary btn-sm float-end" onclick="avaaAanestys='+ndx+'; listaaAanestykset(false,-1);">Peruuta</button>');

                cardbody.appendChild(formi);
            }


            dst.appendChild(klooni);

            if (document.querySelector('#clps'+ndx).classList.contains('show')) {
                header.classList.remove('down');
                header.classList.add('up');
            } else {
                header.classList.remove('up');
                header.classList.add('down');
            }

            document.querySelector('#clps'+ndx).addEventListener('hidden.bs.collapse', evnt => {
                const pes = evnt.target.previousElementSibling;
                if (pes.classList.contains('up')) pes.classList.remove('up');
                pes.classList.add('down');
            });

            document.querySelector('#clps'+ndx).addEventListener('shown.bs.collapse', evnt => {
                const pes = evnt.target.previousElementSibling;
                if (pes.classList.contains('down')) pes.classList.remove('down');
                pes.classList.add('up');
            });
        });
        
    } else {
        document.querySelector('#buttonpoista').setAttribute('disabled','true');
    }
}

function aanestaSubmit(e) {
    e.preventDefault();

    for (let i=0; i<e.target.elements.length; i++) {
        if (e.target.elements[i].type=='radio' && e.target.elements[i].checked) {
            aanestykset[e.target.id].ve[e.target.elements[i].value].aanet += 1;
            avaaAanestys = e.target.id;
            tallennaAanestykset();
            listaaAanestykset(false,-1);
            break;
        }
    }
}

function peruutaPoisto() {
    atr('r','disabled','#buttonluouusi','#buttonpoista');
    atr('s','hidden','#ohje');
    listaaAanestykset(false,-1);
}

function deleteVote() {
    atr('s','disabled','#buttonluouusi','#buttonpoista');
    listaaAanestykset(true,-1);
}

function poista(id) {
    aanestykset.splice(id,1);
    atr('s','hidden','#ohje');
    atr('r','disabled','#buttonluouusi','#buttonpoista');
    tallennaAanestykset();
    listaaAanestykset(false,-1);
}

function varmistaPoisto(id) {
    document.querySelector('#poistonimi').innerText = aanestykset[id].nimi;
    document.querySelector('#poistonappi').onclick = () => { poista(id); };

    let mod = new bootstrap.Modal(document.getElementById('oletkovarma'), {});
    mod.show();
}

document.body.onpageshow = () => {
    listaaAanestykset(false,-1);
}