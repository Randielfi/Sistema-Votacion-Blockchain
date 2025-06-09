using Nethereum.Signer;
using Nethereum.Util;
using System.Text;

public static class SignatureHelper
{
    public static bool VerifySignature(string walletAddress, string signature, string message)
    {
        try
        {
            // Preparar el prefijo estándar de Ethereum
            var signer = new EthereumMessageSigner();
            var recoveredAddress = signer.EncodeUTF8AndEcRecover(message, signature);

            // Comparar direcciones (case insensitive)
            return recoveredAddress.Equals(walletAddress, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}
