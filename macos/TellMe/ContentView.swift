import SwiftUI

struct ContentView: View {
    @State private var isLoading = true

    var body: some View {
        ZStack {
            WebView(
                htmlFileName: "tellme",
                htmlFileExtension: "html",
                isLoading: $isLoading
            )
            .ignoresSafeArea()

            if isLoading {
                ZStack {
                    Color.black.opacity(0.75)
                        .ignoresSafeArea()
                    VStack(spacing: 12) {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .scaleEffect(1.2)
                        Text("Loading...")
                            .foregroundColor(.white.opacity(0.9))
                            .font(.system(size: 16, weight: .medium))
                    }
                }
                .transition(.opacity)
            }
        }
    }
}
