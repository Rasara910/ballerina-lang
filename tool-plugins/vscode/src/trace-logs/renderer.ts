import { ExtendedLangClient } from '../core/extended-language-client';
import { ExtensionContext } from 'vscode';
import { getLibraryWebViewContent } from '../utils';

export function render(context: ExtensionContext, langClient: ExtendedLangClient) 
    : string {
    const script = `
            window.addEventListener('message', event => {
                const message = event.data; // The JSON data our extension sent
                switch (message.command) {
                    case 'updateTraces':
                        drawTraces();
                        break;
                }
            });
            function drawTraces() {
                try {
                    webViewRPCHandler.invokeRemoteMethod('getTraces', [], (traces) => {
                        console.log(traces, window);
                        ballerinaComposer.renderTraceLogs(document.getElementById("traces"), traces, (trace)=>{
                            webViewRPCHandler.invokeRemoteMethod('showDetails', trace);
                        }, ()=>{
                            console.log('clear logs');
                            webViewRPCHandler.invokeRemoteMethod('clearLogs');
                        });
                    });
                    console.log('Successfully rendered tracing...');
                } catch(e) {
                    console.log(e.stack);
                    drawError('Oops. Something went wrong.');
                }
            }
            
            drawTraces();
            drawTraces();
            `;
    const body = `<div id="traces" />`;

    const styles = `
        body.vscode-dark, body.vscode-light {
            background-color: #1e1e1e;
            color: white;
        }
        .clickable {
            cursor: pointer;
        }
        .inverted .ui.dropdown .menu .item .text {
            color: #1e1e1e!important;
        }
        .icon.inbound {
            color: #00bcd4;
        }
        .icon.outbound {
            color: #f1772a;
        }
    `;
    return getLibraryWebViewContent(context, body, script, styles);
}


export function renderDetailView (context: ExtensionContext, langClient: ExtendedLangClient, trace: any) {
    const body = `<div id="trace-details"><br/> 
        <div class="ui segment">
            <div class="ui active transition visible dimmer" style="display: flex !important;">
                <div class="content">
                    <div class="ui text loader">Loading</div>
                </div>
            </div>
        </div>
    </div>`;
    const traceString = encodeURIComponent(JSON.stringify(trace));
    const styles = `
        body.vscode-dark, body.vscode-light {
            background-color: #1e1e1e;
            color: white;
        }
        #trace-details code {
            border: none;
        }
        #trace-details {
            color: #ffffffe6;
        }
        `;
    const script = `
        function renderDetailedTrace(trace) {
            try {
                ballerinaComposer.renderDetailedTrace(document.getElementById("trace-details"), trace);
                console.log('Successfully rendered trace details...');
            } catch(e) {
                console.log(e.stack);
                drawError('Oops. Something went wrong.');
            }
        }
        renderDetailedTrace("${traceString}");
    `;
    return getLibraryWebViewContent(context, body, script, styles);
}