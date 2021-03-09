// install and import AlamoFire (AF)

// Example function to retrieve 3 featured posts for For You page from server
func getFeaturedPosts() {
  AF.request("http://localhost:5000/content/featured", method: .get)
    .validate(statusCode: 200..<300)
    .responseDecodable { (response: DataResponse) in
        switch response.result {
          case .success(let posts): // array of post objects
              print("Retrieved featured posts: \(posts)")
          case .failure(let error):
              print("Featured post retrieval failed with error: \(error.localizedDescription)")
        }
  }
}

//   AF.request("http://localhost:5000/content/featured", method: .get, parameters: ["title": "New York Highlights"])
