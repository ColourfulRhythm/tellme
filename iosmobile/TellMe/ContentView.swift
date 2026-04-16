import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(htmlFileName: "tellme", htmlFileExtension: "html")
            .ignoresSafeArea()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
