using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Contoso.Plugins
{
    public class AccountManager : PluginImplement
    {
        public override void ExecutePlugin(IServiceProvider serviceProvider)
        {
            Entity conta = (Entity)this.Context.InputParameters["Target"];

            QueryExpression recuperarCNPJS = new QueryExpression("account");
            recuperarCNPJS.Criteria.AddCondition("jrl_cnpj", ConditionOperator.Equal, conta["jrl_cnpj"]);
            EntityCollection cnpjsRecuperados = this.Service.RetrieveMultiple(recuperarCNPJS);

            if(cnpjsRecuperados.Entities.Count > 0)
            {
                throw new InvalidPluginExecutionException("Conta já cadastrada.");
            }
        }
    }
}
