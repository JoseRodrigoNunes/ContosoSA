if (typeof (Contoso) == "undefined") {
    Contoso = { __namespace: true };
}

Contoso.conta = {
    _MascaraCNPJ: function () {
        var formContext = executionContext.getFormContext();
        var cnpj = formContext.getAttribute("jrl_cnpj").getValue();

        if (cnpj != null) {
            if (Contoso.conta.ValidarCNPJ(cnpj)) {
                var cnpjFormatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
                // verificar se o CNPJ já existe e apagar o campo se sim
                Xrm.WebApi.online.retrieveMultipleRecords("account", "?$select=jrl_cnpj&$filter=jrl_cnpj eq '" + cnpjFormatado + "'").then(
                    function success(results) {
                        console.log(results);
                        if (results.entities.length > 0) 
                        {
                            var result = results.entities[0];
                            // Columns
                            var accountid = result["accountid"]; // Guid
                            var jrl_cnpj = result["jrl_cnpj"]; // Text
                            console.log("GUID:" + accountid + " | CNPJ:" +jrl_cnpj);
                            Contoso.conta.DynamicsAlert("Por favor, verifique se esse cliente já não possui cadastro ou se o CNPJ foi digitado corretamente.", "CNPJ '"+ jrl_cnpj +"' já cadastrado!");
                        }
                        else{
                            formContext.getAttribute("jrl_cnpj").setValue(cnpjFormatado);
                        }
                    },
                    function(error) {
                        console.log(error.message);
                        alert(error.message);
                    }
                )
            }
            else {
                Contoso.conta.DynamicsAlert("Por favor, digite um CNPJ válido neste campo e tente novamente.", "CNPJ inválido!");
            }
        } else {
            Contoso.conta.DynamicsAlert("Por favor, digite um CNPJ válido neste campo.", "CNPJ em branco!")
        }
    },
    ValidarCNPJ: function (cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj == '') return false;

        if (cnpj.length != 14)
            return false;

        // Elimina CNPJs invalidos conhecidos
        if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
            return false;

        // Valida DVs
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0, tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;

        return true;
    },
    DynamicsAlert: function (alertText, alertTitle) {
        var alertStrings = {
            confirmButtonLabel: "OK",
            text: alertText,
            title: alertTitle
        };

        var alertOptions = {
            heigth: 120,
            width: 200
        };

        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
    }
}