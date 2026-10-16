# Programmifree PDF/A Studio

**Converti i tuoi PDF in PDF/A direttamente nel browser, gratuitamente e senza caricare i documenti su un server.**

Programmifree PDF/A Studio è una web app gratuita e open source per convertire documenti PDF nel formato PDF/A, progettato per favorire la conservazione dei documenti digitali nel lungo periodo.

La conversione e i controlli sui documenti vengono eseguiti direttamente sul dispositivo dell'utente, utilizzando motori open source compilati in WebAssembly.

**[Apri PDF/A Studio](https://www.programmifree.com/web/app/pdfa/)**

## Caratteristiche principali

- **Privacy:** i documenti PDF vengono elaborati direttamente nel browser, senza essere caricati sui server di Programmifree per la conversione.
- **Nessuna registrazione:** l'applicazione è utilizzabile gratuitamente senza creare un account.
- **Conversione multipla:** è possibile selezionare più documenti PDF.
- **Diversi profili PDF/A:** sono disponibili le varianti PDF/A-1b, PDF/A-2a, PDF/A-2b, PDF/A-2u, PDF/A-3a, PDF/A-3b, PDF/A-3u, PDF/A-4, PDF/A-4F e PDF/A-4E.
- **Verifica automatica:** i documenti convertiti vengono controllati per verificare la conformità al profilo selezionato.
- **Due motori di conversione:** Kura, consigliato come impostazione predefinita, e Ghostscript per i profili supportati.
- **Utilizzo offline:** dopo il caricamento iniziale dei componenti necessari, l'app può funzionare anche senza connessione Internet, se il browser conserva la cache.

## Come si usa

1. Apri [PDF/A Studio](https://www.programmifree.com/web/app/pdfa/).
2. Trascina uno o più documenti PDF nell'area indicata oppure clicca per selezionarli dal computer.
3. Scegli il profilo PDF/A desiderato. PDF/A-2b è proposto come impostazione consigliata per un uso generale; se un ente, un archivio o un destinatario richiede uno specifico profilo, seleziona quello richiesto.
4. Lascia attiva la verifica automatica e mantieni il motore Kura consigliato, salvo esigenze particolari.
5. Attendi il completamento della conversione e dei controlli. Quando il risultato è indicato come verificato conforme, puoi scaricare il documento generato.

La prima elaborazione può richiedere il caricamento dei motori WebAssembly, che occupano complessivamente diversi megabyte. Nelle visite successive i componenti possono essere riutilizzati dalla cache del browser.

## Che cosa significa PDF/A?

PDF/A è una famiglia di standard ISO dedicati alla conservazione a lungo termine dei documenti elettronici. Prevede requisiti specifici affinché i documenti possano essere visualizzati in modo affidabile anche in futuro.

Non tutte le varianti PDF/A sono equivalenti: alcune prevedono requisiti aggiuntivi relativi al testo Unicode, alla struttura logica e all'accessibilità, oppure consentono l'inclusione di file allegati.

La scelta del profilo dipende quindi dalle caratteristiche del documento e dai requisiti dell'archivio o dell'organizzazione destinataria.

## Come funziona la verifica

PDF/A Studio integra controlli basati sul motore Kura, con regole di conformità allineate a veraPDF. La verifica automatica permette di individuare diverse anomalie nei documenti generati.

Se si utilizza Ghostscript e il risultato non supera il controllo, l'applicazione tenta automaticamente una conversione alternativa con Kura e verifica nuovamente il documento.

**Importante:** il controllo integrato nel browser non equivale all'esecuzione di un validatore indipendente come veraPDF. Il risultato positivo è un'indicazione concreta dell'esito dei controlli implementati, ma non costituisce una garanzia assoluta di conformità per qualsiasi documento o procedura di archiviazione. Per documenti particolarmente importanti, è opportuno effettuare verifiche indipendenti e seguire i requisiti dell'ente destinatario.

## Limiti e precauzioni

- I PDF protetti da password o cifrati non sono supportati.
- La conversione può comportare modifiche al documento per rispettare i requisiti del profilo PDF/A selezionato. Conserva sempre l'originale e controlla il risultato, soprattutto per documenti importanti.
- Le prestazioni dipendono dal browser, dalla memoria disponibile e dalle dimensioni e complessità dei PDF.

Il software viene fornito «così com'è», senza garanzie di alcun tipo. L'utente è responsabile della verifica dei documenti prima del loro utilizzo o della loro archiviazione.

## Codice sorgente e licenza

PDF/A Studio è distribuito sotto la licenza **GNU Affero General Public License (AGPL), versione 3 o successiva**.

Il codice sorgente è disponibile pubblicamente su GitHub:

**[Programmifree/pdfa-studio](https://github.com/programmifree/pdfa-studio)**

Il progetto include componenti open source, fra cui Ghostscript e Kura, distribuiti con licenza AGPL. I dettagli sui componenti di terze parti e le relative attribuzioni sono disponibili nel file [NOTICE.txt](NOTICE.txt); il testo della licenza è disponibile in [LICENSE.txt](LICENSE.txt).

## Struttura del repository

- `deploy/` — versione pronta per la pubblicazione sul sito.
- `prototype/` — sorgenti di sviluppo, test e documentazione tecnica.
- `make-deploy.cmd` — script Windows per preparare la cartella di distribuzione.

Per maggiori informazioni sullo sviluppo e sulla pubblicazione dell'applicazione, consulta il [README tecnico](prototype/README.md).
